import { Embeddings } from '@langchain/core/embeddings'

export class FakeEmbeddings extends Embeddings {
  constructor(params?: any) {
    super(params)
  }
  async embedQuery(text: string): Promise<number[]> {
    return text.split('').map((char) => (char.charCodeAt(0) % 17) / 17)
  }
  async embedDocuments(texts: string[]): Promise<number[][]> {
    return texts.map((text) => text.split('').map((char) => (char.charCodeAt(0) % 17) / 17))
  }
}
