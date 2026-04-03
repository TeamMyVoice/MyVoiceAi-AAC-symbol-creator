export const GENDERS = ['Male', 'Female', 'Non-binary'];
export const AGES = ['Child', 'Teen', 'Adult'];
export const SKIN_COLORS = ['Light', 'Medium Light', 'Medium', 'Medium Dark', 'Dark'];
export const HAIR_COLORS = ['Brown', 'Black', 'Blonde', 'Gray'];
export const HAIR_LENGTHS = ['Bald', 'Short', 'Medium', 'Long'];
export const EYE_COLORS = ['Blue', 'Brown', 'Green'];
export const CLOTHES_COLORS = ['Blue', 'Yellow', 'Red', 'Gray', 'Pink', 'Orange'];

export const BODY_SIZES = ['Slim', 'Average', 'Chubby', 'Plus Size'];

export const CATEGORIZED_ACTIONS = {
  Emotions: [
    { id: 'happy', label: 'Happy', action: 'smiling happily and looking cheerful' },
    { id: 'sad', label: 'Sad', action: 'looking sad with a frown and a tear' },
    { id: 'angry', label: 'Angry', action: 'looking angry with furrowed brows' },
    { id: 'tired', label: 'Tired', action: 'yawning and looking sleepy' },
    { id: 'hurt', label: 'Hurt', action: 'holding arm looking in pain' },
  ],
  Communication: [
    { id: 'yes', label: 'Yes', action: 'nodding head yes with a thumbs up' },
    { id: 'no', label: 'No', action: 'shaking head no with a thumbs down' },
    { id: 'want', label: 'Want', action: 'reaching out with open hands indicating want' },
    { id: 'stop', label: 'Stop', action: 'holding one hand up in a stop gesture' },
    { id: 'more', label: 'More', action: 'tapping fingertips together indicating more' },
    { id: 'pointing_outward', label: 'Pointing Outward', action: 'pointing finger outward towards the viewer' },
    { id: 'pointing_self', label: 'Pointing at Self', action: 'pointing finger at own chest' },
  ],
  Activities: [
    { id: 'eating', label: 'Eating', action: 'eating food with a spoon' },
    { id: 'drinking', label: 'Drinking', action: 'drinking from a cup' },
    { id: 'holding', label: 'Holding', action: 'holding a generic object in hands' },
    { id: 'raising_hands', label: 'Raising Hands', action: 'raising both hands up in the air' },
    { id: 'walking', label: 'Walking', action: 'walking forward' },
    { id: 'jumping', label: 'Jumping', action: 'jumping up in the air' },
    { id: 'sleeping', label: 'Sleeping', action: 'sleeping with eyes closed and head resting on hands' },
    { id: 'sitting', label: 'Sitting', action: 'sitting down on a chair' },
    { id: 'writing', label: 'Writing', action: 'writing on a piece of paper with a pencil' },
  ]
};

export const AAC_ACTIONS = Object.values(CATEGORIZED_ACTIONS).flat();
