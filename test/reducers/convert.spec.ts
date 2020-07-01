import { AnyAction } from 'redux';
import ConvertReducer from '../../app/store/reducers/convert';
import * as ConvertActions from '../../app/store/actions/convert';

describe('reducers', () => {
  describe('convert', () => {
    it('should handle initial state', () => {
      expect(ConvertReducer(undefined, {} as AnyAction)).toMatchSnapshot();
    });

    it('should handle SET_BASE_JADN_SUCCESS', () => {
      expect(
        ConvertReducer({ }, {
          type: ConvertActions.SET_BASE_JADN_SUCCESS,
          payload: {}
        })
      ).toMatchSnapshot();
    });

    it('should handle CONVERT_TO_JSON_SUCCESS', () => {
      expect(
        ConvertReducer({ }, {
          type: ConvertActions.CONVERT_TO_JSON_SUCCESS,
          payload: {}
        })
      ).toMatchSnapshot();
    });

    it('should handle CONVERT_TO_MARKDOWN_SUCCESS', () => {
      expect(
        ConvertReducer({ }, {
          type: ConvertActions.CONVERT_TO_MARKDOWN_SUCCESS,
          payload: ''
        })
      ).toMatchSnapshot();
    });

    it('should handle unknown action type', () => {
      expect(
        ConvertReducer({ }, { type: 'unknown' })
      ).toMatchSnapshot();
    });
  });
});
