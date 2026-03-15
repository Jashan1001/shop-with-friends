import {
  ShoppingCart,
  Laptop,
  Footprints,
  Smartphone,
  House,
  Shirt,
  Gamepad2,
  BookOpen,
  Pizza,
  Plane,
} from 'lucide-react'

export const ROOM_ICON_OPTIONS = [
  { value: 'cart', icon: ShoppingCart, label: 'Shopping' },
  { value: 'laptop', icon: Laptop, label: 'Tech' },
  { value: 'footwear', icon: Footprints, label: 'Footwear' },
  { value: 'phone', icon: Smartphone, label: 'Phones' },
  { value: 'home', icon: House, label: 'Home' },
  { value: 'fashion', icon: Shirt, label: 'Fashion' },
  { value: 'gaming', icon: Gamepad2, label: 'Gaming' },
  { value: 'books', icon: BookOpen, label: 'Books' },
  { value: 'food', icon: Pizza, label: 'Food' },
  { value: 'travel', icon: Plane, label: 'Travel' },
]

const LEGACY_ROOM_ICON_MAP = {
  '🛒': 'cart',
  '💻': 'laptop',
  '👟': 'footwear',
  '📱': 'phone',
  '🏠': 'home',
  '👗': 'fashion',
  '🎮': 'gaming',
  '📚': 'books',
  '🍕': 'food',
  '✈️': 'travel',
}

export function getRoomIconOption(value) {
  const normalizedValue = LEGACY_ROOM_ICON_MAP[value] || value || 'cart'
  return ROOM_ICON_OPTIONS.find((option) => option.value === normalizedValue) || ROOM_ICON_OPTIONS[0]
}