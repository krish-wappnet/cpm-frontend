import { RootState } from '../store/rootReducer';

declare module 'react-redux' {
  type DefaultRootState = RootState;
}

declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION__?: {
      connect: (options?: { name?: string }) => {
        subscribe: (listener: (message: unknown) => void) => () => void;
        send: (action: unknown, state: unknown) => void;
        init: (state: unknown) => void;
      };
    };
  }
}
