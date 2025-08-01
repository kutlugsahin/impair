import 'tsyringe'

declare module 'tsyringe' {
  interface DependencyContainer {
    getParentContainer(): DependencyContainer | undefined
    setParentContainer(container: DependencyContainer): void
  }
}

declare global {
  namespace Reflect {
    function metadata(metadataKey: any, metadataValue: any): any
    function getMetadata(metadataKey: any, target: any): any
  }
}

export {}
