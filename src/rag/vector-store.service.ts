import { Injectable } from '@nestjs/common'
import { OpenAI } from 'openai'

function cosineSimilarity(a: number[], b: number[]): number {
  const dot = a.reduce((sum, ai, i) => sum + ai * b[i], 0)
  const normA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0))
  const normB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0))
  return dot / (normA * normB)
}

@Injectable()
export class VectorStoreService {
  private openai: OpenAI
  private docs: { id: string; text: string; embedding: number[] }[] = []

  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  }

  /*async embed(text: string): Promise<number[]> {
    const res = await this.openai.embeddings.create({
      input: text,
      model: 'text-embedding-ada-002',
    });
    return res.data[0].embedding;
  }*/

  async embed(text: string): Promise<number[]> {
    return text.split('').map((char) => (char.charCodeAt(0) % 17) / 17)
  }

  async addDocument(id: string, text: string) {
    const embedding = await this.embed(text)
    this.docs.push({ id, text, embedding })
  }

  async query(text: string, topK = 3): Promise<{ id: string; text: string; score: number }[]> {
    const embedding = await this.embed(text)
    const results = this.docs
      .map((doc) => ({
        id: doc.id,
        text: doc.text,
        score: cosineSimilarity(embedding, doc.embedding),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
    return results
  }
}
