import { Injectable } from '@nestjs/common';

@Injectable()
export class CategorizationService {
  private readonly MERCHANT_RULES: Record<string, string> = {
    // Transportation
    'UBER': 'Transportation',
    'LYFT': 'Transportation',
    'TAXI': 'Transportation',
    'GAS': 'Transportation',
    'SHELL': 'Transportation',
    'ESSO': 'Transportation',
    'PETRO': 'Transportation',
    'PARKING': 'Transportation',
    'TTC': 'Transportation',
    'GO TRANSIT': 'Transportation',
    'VIA RAIL': 'Transportation',
    'AIR CANADA': 'Transportation',
    'WESTJET': 'Transportation',
    
    // Groceries
    'SHOPPERS': 'Groceries',
    'LOBLAWS': 'Groceries',
    'METRO': 'Groceries',
    'SOBEYS': 'Groceries',
    'FRESHCO': 'Groceries',
    'NO FRILLS': 'Groceries',
    'SUPERSTORE': 'Groceries',
    'COSTCO': 'Groceries',
    'WALMART': 'Groceries',
    'WHOLE FOODS': 'Groceries',
    'FOOD BASICS': 'Groceries',
    'FARM BOY': 'Groceries',
    'LONGOS': 'Groceries',
    'ZEHRS': 'Groceries',
    
    // Entertainment
    'NETFLIX': 'Entertainment',
    'SPOTIFY': 'Entertainment',
    'APPLE MUSIC': 'Entertainment',
    'DISNEY': 'Entertainment',
    'AMAZON PRIME': 'Entertainment',
    'CRAVE': 'Entertainment',
    'STEAM': 'Entertainment',
    'PLAYSTATION': 'Entertainment',
    'XBOX': 'Entertainment',
    'NINTENDO': 'Entertainment',
    'CINEPLEX': 'Entertainment',
    'MOVIES': 'Entertainment',
    'THEATRE': 'Entertainment',
    'CONCERT': 'Entertainment',
    
    // Shopping
    'AMAZON': 'Shopping',
    'EBAY': 'Shopping',
    'BEST BUY': 'Shopping',
    'CANADIAN TIRE': 'Shopping',
    'HOMEDEPOT': 'Shopping',
    'IKEA': 'Shopping',
    'APPLE STORE': 'Shopping',
    'MICROSOFT': 'Shopping',
    'GOOGLE': 'Shopping',
    'FACEBOOK': 'Shopping',
    'INSTAGRAM': 'Shopping',
    'TIKTOK': 'Shopping',
    'TWITTER': 'Shopping',
    'LINKEDIN': 'Shopping',
    
    // Food & Dining
    'MCDONALDS': 'Food & Dining',
    'TIM HORTONS': 'Food & Dining',
    'STARBUCKS': 'Food & Dining',
    'SUBWAY': 'Food & Dining',
    'PIZZA PIZZA': 'Food & Dining',
    'DOMINOS': 'Food & Dining',
    'KFC': 'Food & Dining',
    'BURGER KING': 'Food & Dining',
    'WENDYS': 'Food & Dining',
    'A&W': 'Food & Dining',
    'HARVEYS': 'Food & Dining',
    'MARY BROWN': 'Food & Dining',
    'SWISS CHALET': 'Food & Dining',
    'EASTSIDE MARIO': 'Food & Dining',
    
    // Healthcare
    'PHARMACY': 'Healthcare',
    'DOCTOR': 'Healthcare',
    'DENTIST': 'Healthcare',
    'HOSPITAL': 'Healthcare',
    'CLINIC': 'Healthcare',
    'MEDICAL': 'Healthcare',
    'HEALTH': 'Healthcare',
    'VISION': 'Healthcare',
    'OPTICAL': 'Healthcare',
    
    // Utilities
    'HYDRO': 'Utilities',
    'ELECTRIC': 'Utilities',
    'GAS COMPANY': 'Utilities',
    'WATER': 'Utilities',
    'INTERNET': 'Utilities',
    'PHONE': 'Utilities',
    'CELL': 'Utilities',
    'ROGERS': 'Utilities',
    'BELL': 'Utilities',
    'TELUS': 'Utilities',
    'SHAW': 'Utilities',
    'COGECO': 'Utilities',
    'VIDEOTRON': 'Utilities',
    
    // Financial
    'BANK': 'Financial',
    'ATM': 'Financial',
    'CREDIT CARD': 'Financial',
    'LOAN': 'Financial',
    'MORTGAGE': 'Financial',
    'INVESTMENT': 'Financial',
    'INSURANCE': 'Financial',
    'PAYMENT': 'Financial',
    'TRANSFER': 'Financial',
    'WITHDRAWAL': 'Financial',
    'DEPOSIT': 'Financial',
    
    // Education
    'UNIVERSITY': 'Education',
    'COLLEGE': 'Education',
    'SCHOOL': 'Education',
    'TUITION': 'Education',
    'BOOKSTORE': 'Education',
    'STUDENT': 'Education',
    
    // Travel
    'HOTEL': 'Travel',
    'AIRBNB': 'Travel',
    'BOOKING': 'Travel',
    'EXPEDIA': 'Travel',
    'TRIPADVISOR': 'Travel',
    'CAR RENTAL': 'Travel',
    'HERTZ': 'Travel',
    'AVIS': 'Travel',
    'ENTERPRISE': 'Travel',
    
    // Other
    'GOVERNMENT': 'Government',
    'CRA': 'Government',
    'SERVICE CANADA': 'Government',
    'POSTAL': 'Government',
    'CANADA POST': 'Government',
    'FEDEX': 'Government',
    'UPS': 'Government',
    'DHL': 'Government',
  };

  categorize(merchant: string): string {
    if (!merchant) return 'Uncategorized';
    
    const normalized = merchant.toUpperCase().trim();
    
    // Direct match first
    if (this.MERCHANT_RULES[normalized]) {
      return this.MERCHANT_RULES[normalized];
    }
    
    // Pattern matching
    for (const [pattern, category] of Object.entries(this.MERCHANT_RULES)) {
      if (normalized.includes(pattern)) {
        return category;
      }
    }
    
    return 'Uncategorized';
  }

  normalizeMerchantName(merchant: string): string {
    if (!merchant) return '';
    
    return merchant
      .toLowerCase()
      .replace(/^(debit|credit|payment|transfer)\s+/i, '')
      .replace(/\s+(debit|credit|payment|transfer)$/i, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  getCategoryRules(): Record<string, string> {
    return { ...this.MERCHANT_RULES };
  }

  addCustomRule(pattern: string, category: string): void {
    this.MERCHANT_RULES[pattern.toUpperCase()] = category;
  }

  removeCustomRule(pattern: string): void {
    delete this.MERCHANT_RULES[pattern.toUpperCase()];
  }
}
