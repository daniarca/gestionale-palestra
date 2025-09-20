// File: src/utils/numberToWords.js

const units = ['', 'uno', 'due', 'tre', 'quattro', 'cinque', 'sei', 'sette', 'otto', 'nove'];
const teens = ['dieci', 'undici', 'dodici', 'tredici', 'quattordici', 'quindici', 'sedici', 'diciassette', 'diciotto', 'diciannove'];
const tens = ['', 'dieci', 'venti', 'trenta', 'quaranta', 'cinquanta', 'sessanta', 'settanta', 'ottanta', 'novanta'];
const thousands = ['', 'mille', 'milioni', 'miliardi'];

function convertLessThanOneThousand(num) {
  if (num === 0) return '';
  if (num < 10) return units[num];
  if (num < 20) return teens[num - 10];
  if (num < 100) {
    const ten = Math.floor(num / 10);
    const unit = num % 10;
    let word = tens[ten];
    if (unit > 0) {
      if (unit === 1 || unit === 8) {
        word = word.slice(0, -1);
      }
      word += units[unit];
    }
    return word;
  }
  const hundred = Math.floor(num / 100);
  const rest = num % 100;
  let word = units[hundred] + 'cento';
  if (rest > 0) {
    word += convertLessThanOneThousand(rest);
  }
  return word;
}

export function numberToWords(num) {
  if (num === 0) return 'zero';
  if (num < 0) return 'meno ' + numberToWords(-num);
  
  let word = '';
  let i = 0;
  
  do {
    const n = num % 1000;
    if (n !== 0) {
      const chunk = convertLessThanOneThousand(n);
      const thousandUnit = thousands[i];
      
      if (i === 1 && n === 1) { // L'eccezione per "mille"
        word = 'mille ' + word;
      } else if (i > 0) {
        word = chunk + thousandUnit + ' ' + word;
      } else {
        word = chunk + ' ' + word;
      }
    }
    i++;
    num = Math.floor(num / 1000);
  } while (num > 0);
  
  return word.trim();
}