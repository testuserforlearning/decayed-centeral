declare global {
  interface Window {
    $scramjetLoadController?: () => {
      ScramjetController: any
    }
  }
}

export {}
