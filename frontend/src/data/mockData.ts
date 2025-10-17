export const shops = [
  {
    id: 1,
    name: "Tech Haven",
    details: "Your one-stop shop for all things tech.",
    address: "123 Tech Street",
    contact_number: "123-456-7890",
    operating_hours: "9 AM - 9 PM",
    items: [
      { id: 1, name: "Wireless Mouse", price: "$25" },
      { id: 2, name: "Mechanical Keyboard", price: "$80" },
    ],
  },
  {
    id: 2,
    name: "Gadget World",
    details: "Latest gadgets and accessories.",
    address: "456 Gadget Avenue",
    contact_number: "123-456-7890",
    operating_hours: "9 AM - 9 PM",
    items: [
      { id: 3, name: "Wireless Mouse", price: "$27" },
      { id: 4, name: "Smartwatch", price: "$120" },
    ],
  },
  {
    id: 3,
    name: "Office Supplies Co.",
    details: "Everything you need for your office.",
    address: "789 Office Blvd",
    contact_number: "123-456-7890",
    operating_hours: "9 AM - 9 PM",
    items: [
      { id: 5, name: "Notebook", price: "$5" },
      { id: 6, name: "Pen", price: "$1" },
    ],
  },
];

export const items = [
    { id: 1, name: "Wireless Mouse", price: "$25" },
    { id: 2, name: "Mechanical Keyboard", price: "$80" },
    { id: 3, name: "Wireless Mouse", price: "$27" },
    { id: 4, name: "Smartwatch", price: "$120" },
    { id: 5, name: "Notebook", price: "$5" },
    { id: 6, name: "Pen", price: "$1" },
]

export const reviews = [
    { id: 1, itemId: 1, rating: 5, comment: "Great mouse!" },
    { id: 2, itemId: 1, rating: 4, comment: "Good value for money." },
    { id: 3, itemId: 2, rating: 5, comment: "Loving the clicky keys!" },
]

export const users = [
  {
    id: 1,
    name: "Alice Johnson",
    email: "alice@example.com",
    password: "password123",
    reviewIds: [1, 3], // references to reviews
  },
  {
    id: 2,
    name: "Bob Smith",
    email: "bob@example.com",
    password: "password123",
    reviewIds: [2], // references to reviews
  },
];