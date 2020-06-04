# Schema Generator App

### About
- An [ElectronJS](https://www.electronjs.org/) desktop application for creating, editing, and exporting [JADN](https://github.com/oasis-open/openc2-jadn-software) documents. 

### Download
Note: A Windows .exe version is still currently in progress. This app is currently available on Linux and MacOS systems
- No external dependencies required; simply download the app and run
- Linux version available as an [AppImage](https://appimage.org/) [here](www.google.com).
- MacOS version available [here](www.google.com)

### Quick Guide
- Create a JADN schema from scratch, or import an existing file (see [Constructing a JADN schema](#constructing-a-jadn-schema) below)
    - To import an existing JADN schema, go to `File -> Import` and select document. The schema will load automatically in the JADN editor. 
- The GUI is primarily a drag-and-drop. Drag the desired elements on the left-side panel into the editor to populate it, and edit as necessary. 
    - Toggle between the JADN and JSON editors to view progress. The JSON editor is read-only.
- After constructing the desired JADN schema, save or export it as a different file format. Supported formats include HTML, JSON, MarkDown, and PDF. 
    - N.B. Invalid schemas will not allow converting to different file formats. Schema validation currently in progress.

### Constructing a JADN schema
- While JADN is flexible and highly customizable, a properly formatted schema must meet these minimal requirements
    - `Module` and `Exports` must be present under `Meta`
    - At least one item must be present under `Type`
        1. Type name cannot be the same as the default name (e.g. type 'choice' must be renamed)
        2. Type name must contain only alphanumeric characters
        3. Type name must begin with a capital letter
        4. Type name must be added as a new entry under `Exports` (case-sensitive)
            -  N.B. Any additional `Type` items need not be added to `Exports`
            
- A sample template reflecting these basic requirements is available [here](./template.jadn). Importing this template and modifying as necessary is the easiest way to get started
