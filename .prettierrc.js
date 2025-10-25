// .prettierrc.js
module.exports = {
  // Ставити крапку з комою в кінці рядків
  semi: true,

  // Використовувати одинарні лапки в JS/TS
  singleQuote: true,

  // Використовувати подвійні лапки у JSX
  jsxSingleQuote: false,

  // Додавати кому у кінці об'єктів, масивів і параметрів функцій
  trailingComma: 'es5', // "es5" сумісно з більшістю ESLint конфігів

  // Максимальна довжина рядка
  printWidth: 80,

  // Ширина табуляції
  tabWidth: 2,

  // Додає пробіли між дужками об’єктів { a: 1 }
  bracketSpacing: true,

  // Закриваючий тег JSX на новому рядку
  bracketSameLine: false,

  // Завжди ставити дужки у стрілкових функціях з одним аргументом
  arrowParens: 'always'
};
