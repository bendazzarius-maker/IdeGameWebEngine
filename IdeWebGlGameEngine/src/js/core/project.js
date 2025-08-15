// Palette des pins (utile si tu veux réutiliser ailleurs)
export const PinMap = {
  bool:   '#ef4444',
  float:  '#9ca3af',
  int:    '#22c55e',
  string: '#60a5fa',
  time:   '#ffffff',
  object: '#fb923c',
  audio:  '#a78bfa',
  video:  '#fef9c3',
  vector: '#7c3aed'
};

// État projet minimal partagé par les modules
export const Project = {
  name: "Untitled",
  objects: ["PlayerCapsule","Track_A01","WaterVolume","SkyDome"],
  scripts: {},
  current: { name: "MyLogic", assignedTo: "PlayerCapsule" }
};
