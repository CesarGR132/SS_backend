export class FileNode {
  constructor (name, isDirectory = false, path, creationDate, size, type, owner) {
    this.name = name
    this.isDirectory = isDirectory
    this.path = path
    this.children = []
    this.size = size
    this.type = type
    this.creationDate = creationDate
    this.owner = owner
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
      creationDate: this.creationDate,
      ...(!this.isDirectory && { size: this.size }),
      ...(!this.isDirectory && { type: this.type }),
      ...(!this.isDirectory && { owner: this.owner }),
      ...(this.isDirectory && { children: this.children.map(child => child.toJSON()) })
    }
  }

  static fromJSON (json) {
    const fileNode = new FileNode(json.name, json.isDirectory, json.path, json.creationDate, json.size, json.type, json.owner)
    if (json.children && Array.isArray(json.children)) {
      json.children = json.children.map(child => FileNode.fromJSON(child))
    }
    return fileNode
  }
}
