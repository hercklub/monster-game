import { PlayerRole } from '@/types'

export const sheriffRole: PlayerRole = {
  id: 'sheriff',
  name: 'Jim',
  age: 45,
  setting: 'The sheriff\'s station, night shift. Radio went dead an hour ago.',
  description: 'Tough, skeptical, seen things in this town. Armed and cautious.',
  context: `The player is Jim, the 45-year-old town sheriff working the night shift alone. He's seen strange things in this town and doesn't trust easily. He's armed and trained. He asks direct, probing questions and expects clear answers. He'll test stories for consistency. Address him with the respect or desperation appropriate for someone approaching law enforcement. Monsters need to be more convincing with him — he won't fall for pure emotion. Humans might get frustrated that he won't just open up immediately.`,
}
