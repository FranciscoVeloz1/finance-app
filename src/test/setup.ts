import '@testing-library/jest-dom/vitest';

// jsdom does not implement the native dialog modal API used by components/forms/Dialog.
if (!HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.open = true;
  };
}

if (!HTMLDialogElement.prototype.close) {
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.open = false;
    this.dispatchEvent(new Event('close'));
  };
}

if (!window.matchMedia) {
  window.matchMedia = (query: string) => {
    return {
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => {
        return false;
      },
    } as unknown as MediaQueryList;
  };
}
