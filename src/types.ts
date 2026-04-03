export interface CharacterAttributes {
  gender: string;
  age: string;
  skinColor: string;
  hairColor: string;
  hairLength: string;
  eyeColor: string;
  clothesColor: string;
  bodySize: string;
}

export interface GeneratedIcon {
  id: string;
  actionId: string;
  label: string;
  imageUrl: string | null;
  isLoading: boolean;
  error: string | null;
}
