export function getFirstName(fullName: string | null | undefined): string {
  const first = (fullName || '').trim().split(/\s+/)[0]
  return first || 'Hola'
}

export function getInitial(name: string | null | undefined): string {
  return name?.trim()?.[0]?.toUpperCase() ?? '?'
}
