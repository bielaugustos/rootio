import { semanticTokens } from './semantic'

export function useSemanticTokens() {
  return semanticTokens
}

export function getSemanticToken<K extends keyof typeof semanticTokens>(
  category: K
): typeof semanticTokens[K] {
  return semanticTokens[category]
}