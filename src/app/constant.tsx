type mapType = {
  [key: string]: string
}

export const AudioMap: mapType = {
  game: 'audio/game_music.ogg',
  gamePass: 'audio/game_pass.ogg',
  noHit: 'audio/no_hit.ogg',
  overMusic: 'audio/over_music.ogg',
  secondMusic: 'audio/second_music.ogg',
}

export const spineAssets = {
  rabbit: {
    jsonUrl: 'assets/rabbit/test_rabbit_000.json',
    atlasUrl: 'assets/rabbit/test_rabbit_000.atlas',
  },
  mallet: {
    jsonUrl: 'assets/mallet/mallet.json',
    atlasUrl: 'assets/mallet/mallet.atlas',
  },
}

export const rabbitHolePosition = [
  {
    left: 75,
    top: 235,
  },
  {
    left: 250,
    top: 235,
  },
  {
    left: 425,
    top: 235,
  },
  {
    left: 75,
    top: 385,
  },
  {
    left: 250,
    top: 385,
  },
  {
    left: 425,
    top: 385,
  },
  {
    left: 75,
    top: 535,
  },
  {
    left: 250,
    top: 535,
  },
  {
    left: 425,
    top: 535,
  },
]
