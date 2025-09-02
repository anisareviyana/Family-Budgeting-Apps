
export const INCOME_CATEGORIES = [
  'Salary',
  'Bonus',
  'Freelance',
  'Investment',
  'Gift',
  'Other'
];

export const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Groceries',
  'Housing',
  'Transportation',
  'Utilities',
  'Health & Wellness',
  'Entertainment',
  'Shopping',
  'Education',
  'Travel',
  'Personal Care',
  'Other'
];

export const CURRENCIES = [
  { code: 'USD', name: 'United States Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'GBP', name: 'British Pound Sterling' },
  { code: 'AUD', name: 'Australian Dollar' },
  { code: 'CAD', name: 'Canadian Dollar' },
  { code: 'CHF', name: 'Swiss Franc' },
  { code: 'CNY', name: 'Chinese Yuan' },
  { code: 'INR', name: 'Indian Rupee' },
  { code: 'IDR', name: 'Indonesian Rupiah' },
];

export const COMMON_DESCRIPTIONS: { [key: string]: string[] } = {
  'Food & Dining': ['Restaurant', 'Cafe', 'Fast Food', 'Delivery', 'Bar'],
  'Groceries': ['Supermarket', 'Farmers Market', 'Convenience Store'],
  'Housing': ['Rent', 'Mortgage', 'Home Insurance', 'Repairs'],
  'Transportation': ['Gas/Fuel', 'Public Transit', 'Taxi/Rideshare', 'Parking', 'Car Maintenance'],
  'Utilities': ['Electricity', 'Water', 'Gas', 'Internet', 'Phone Bill'],
  'Health & Wellness': ['Pharmacy', 'Doctor', 'Gym Membership', 'Dentist'],
  'Entertainment': ['Movies', 'Concert', 'Streaming Service', 'Games'],
  'Shopping': ['Clothing', 'Electronics', 'Home Goods', 'Gifts'],
  'Education': ['Tuition', 'Books', 'Online Course'],
  'Travel': ['Flights', 'Hotel', 'Vacation'],
  'Personal Care': ['Haircut', 'Toiletries'],
  'Salary': ['Monthly Salary', 'Paycheck'],
  'Bonus': ['Performance Bonus', 'Annual Bonus'],
  'Freelance': ['Project Payment', 'Consulting Fee'],
  'Investment': ['Dividends', 'Stock Sale'],
  'Gift': ['Birthday Gift', 'Holiday Gift'],
  'Other': [],
};