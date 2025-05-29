export class FileNode {
  constructor (name, isDirectory = false, path) {
    this.name = name
    this.isDirectory = isDirectory
    this.path = path
    this.children = []
  }

  addChild (child) {
    if (!this.isDirectory) {
      throw new Error('Cannot add child to a file node')
    }
    this.children.push(child)
  }

  removeChild (child) {
    this.children = this.children.filter(c => c !== child)
  }

  toJSON () {
    return {
      name: this.name,
      isDirectory: this.isDirectory,
      path: this.path,
      ...(this.isDirectory && { children: this.children.map(child => child.toJSON()) })
    }
  }

  static fromJSON (json) {
    const fileNode = new FileNode(json.name, json.isDirectory, json.path, json.content)
    if (json.children && Array.isArray(json.children)) {
      json.children = json.children.map(child => FileNode.fromJSON(child))
    }
    return fileNode
  }
}
