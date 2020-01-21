// Base on https://github.com/gabrielfreire/neuralnet.js/tree/wasm-nodejs
const path = require('path')
const fs = require('fs')
const fetch = require('isomorphic-fetch')

const externalURL = 'https://iodide.io/pyodide-demo/'

const localURL = path.join(__dirname, '/')
const localPackagesURL = path.join(localURL, '/packages/')

const packages = require('./packages/packages.json').dependencies

const loadedPackages = new Set()

class PyodideNode {
  constructor() {
    this.env = 'node'
    this._setEnvironment()
  }

  _setEnvironment() {
    if (typeof process !== 'undefined') {
      this.env = 'node'
    } else if (typeof window !== 'undefined') {
      this.env = 'browser'
    } else {
      this.env = 'none'
    }
  }

  getModule() {
    if (!process.pyodide) {
      throw "Pyodide wasn't loaded yet"
    }
    return process.pyodide
  }

  loadLanguage() {
    return new Promise((resolve, reject) => {
      let Module = {}
      let pyodide = {}

      this._fetch_node(path.join(localURL, 'pyodide.asm.wasm')).then((buffer) => buffer.buffer()).then(async (arrayBuffer) => { // get locally
        Module['noImageDecoding'] = true
        Module['noAudioDecoding'] = true
        Module['noWasmDecoding'] = true
        Module['filePackagePrefixURL'] = localURL
        Module['locateFile'] = (path) => localURL + path
        Module['instantiateWasm'] = (info, receiveInstance) => {
          WebAssembly.compile(arrayBuffer).then(async module => {
              // add Module to the process
              process['Module'] = Module
              // load pyodide.asm.data.js (python standard libraries)
              let pkgUrl = await this._fetch_node(path.join(localURL, 'pyodide.asm.data.js'))
              eval(pkgUrl && pkgUrl.buffer() ? pkgUrl.buffer().toString() : '')
              return WebAssembly.instantiate(module, info)
            })
            .then(instance => receiveInstance(instance))
            .catch((err) => console.log(`ERROR: ${err}`))
          return {}
        }
        Module['global'] = global
        Module['postRun'] = () => {
          // remove module from the process
          Module = null
          // setup pyodide and add to the process
          pyodide['filePackagePrefixURL'] = localPackagesURL
          pyodide['loadPackage'] = this._loadPackage
          pyodide['locateFile'] = (path) => localPackagesURL + path
          process['Module'] = null
          pyodide._module = pyodide
          process['pyodide'] = pyodide
          console.log('Loaded Python')
          resolve()
        }

        // eval module code
        let pyodideModuleInitializer = require('./pyodide.asm.js')
        // let pyodideModuleInitializer = eval(buffer.toString())
        // load module
        pyodide = pyodideModuleInitializer(Module)
      }).catch((e) => {
        reject(e)
      })
    })
  }

  _loadPackage(names) {
    // DFS to find all dependencies of the requested packages
    let queue = [].concat(names || [])
    let toLoad = new Set()

    while (queue.length) {
      const pkg = queue.pop()
      if (!packages.hasOwnProperty(pkg)) {
        throw `Unknown package '${pkg}'`
      }
      if (!loadedPackages.has(pkg)) {
        toLoad.add(pkg)
        packages[pkg].forEach((subpackage) => {
          if (!loadedPackages.has(subpackage) &&
            !toLoad.has(subpackage)) {
            queue.push(subpackage)
          }
        })
      }
    }

    return new Promise((resolve, reject) => {
      console.log('Loading packages...')
      if (toLoad.size === 0) {
        resolve('No new packages to load')
      }

      process.pyodide['monitorRunDependencies'] = (n) => {
        if (n === 0) {
          toLoad.forEach((pkg) => loadedPackages.add(pkg))
          delete process.pyodide.monitorRunDependencies
          const packageList = Array.from(toLoad.keys()).join(', ')
          console.log(`Loaded ${packageList}`)
          resolve(`Loaded ${packageList}`)
        }
      }
      toLoad.forEach(async (pkg) => {
        const pkgLocalURL = path.join(localPackagesURL, `/${pkg}.js`)
        const pkgExternalURL = `${externalURL}${pkg}.js`
        if (!fs.existsSync(pkgLocalURL)) {
          // fetch
          const file = await this._fetch_node(pkgExternalURL)
          if (!file) reject(`ERROR 404, package ${pkg} was not found`)
          const buffer = await file.buffer()
          if (!buffer) reject()
          fs.writeFileSync(pkgLocalURL, buffer)
        }
        // load dependency
        try {
          require(pkgLocalURL)
        } catch (e) {
          reject(`${pkg}.js file does not support NodeJS, please write the support by hand`)
        }
      })

      // We have to invalidate Python's import caches, or it won't
      // see the new files. This is done here so it happens in parallel
      // with the fetching over the network.
      process.pyodide.runPython(
        'import importlib as _importlib\n' +
        '_importlib.invalidate_caches()\n')
    })
  }

  _fetch_node(file) {
    return new Promise((resolve, reject) => {
      if (file.indexOf('http') == -1) {
        fs.readFile(file, (err, data) => err ? reject(err) : resolve({
          buffer: () => data
        }))
      } else {
        fetch(file).then((buff) => resolve({
          buffer: () => buff.buffer()
        }))
      }
    })
  }
}

module.exports = new PyodideNode()