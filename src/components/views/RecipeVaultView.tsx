import React, { useState, useMemo, useEffect } from 'react';
import {
  UtensilsCrossed,
  Plus,
  Search,
  Clock,
  Users,
  Printer,
  Sparkles,
  ExternalLink,
  Trash2,
  Edit3,
  ShoppingCart,
  Check,
  ChevronRight,
  BookOpen,
  Filter,
  CheckSquare,
  Square,
  Flame,
  ChefHat,
  Tag,
  Minus,
  ArrowRight,
  ListPlus,
  RefreshCw,
  Heart,
  Link as LinkIcon,
  FileText,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
  ListFilter,
  Layers,
} from 'lucide-react';
import {
  RecipeItem,
  RecipeIngredient,
  ShoppingListItem,
  GroceryDepartment,
  FullPageView,
  ContextMode,
} from '../../types';
import {
  GROCERY_DEPARTMENTS,
  POPULAR_RECIPE_TAGS,
} from '../../constants';
import { ModuleNavHeader } from './ModuleNavHeader';
import { Modal } from '../Modal';

interface RecipeVaultViewProps {
  recipes: RecipeItem[];
  shoppingList: ShoppingListItem[];
  activeMode: ContextMode;
  familyKidsMode?: boolean;
  onAddRecipe: (recipe: Omit<RecipeItem, 'id'>) => void;
  onUpdateRecipe: (recipe: RecipeItem) => void;
  onDeleteRecipe: (id: number) => void;
  onAddShoppingItem: (item: Omit<ShoppingListItem, 'id'>) => void;
  onAddMultipleShoppingItems: (items: Omit<ShoppingListItem, 'id'>[]) => void;
  onToggleShoppingItem: (id: string) => void;
  onDeleteShoppingItem: (id: string) => void;
  onClearCheckedShoppingItems: () => void;
  onClearAllShoppingItems: () => void;
  onBackToDashboard: () => void;
  onSwitchView: (view: FullPageView) => void;
}

// Department display config
export const DEPARTMENT_CONFIG: Record<
  GroceryDepartment,
  { label: string; icon: string; badgeClass: string; borderClass: string }
> = {
  Produce: {
    label: ' Produce',
    icon: '🥦',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    borderClass: 'border-emerald-200',
  },
  'Dairy & Refrigerated': {
    label: ' Dairy & Refrigerated',
    icon: '🧈',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
    borderClass: 'border-amber-200',
  },
  'Meat & Seafood': {
    label: 'Meat & Seafood',
    icon: '🥩',
    badgeClass: 'bg-rose-50 text-rose-800 border-rose-200',
    borderClass: 'border-rose-200',
  },
  'Pantry & Dry Goods': {
    label: ' Pantry & Dry Goods',
    icon: '🥫',
    badgeClass: 'bg-stone-100 text-stone-800 border-stone-300',
    borderClass: 'border-stone-200',
  },
  'Bakery & Snacks': {
    label: ' Bakery & Snacks',
    icon: '🧃',
    badgeClass: 'bg-purple-50 text-purple-800 border-purple-200',
    borderClass: 'border-purple-200',
  },
  Other: {
    label: ' Other / Household',
    icon: '🧺',
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-200',
    borderClass: 'border-slate-200',
  },
};

// Automatic Department Classifier
export function categorizeIngredient(name: string): GroceryDepartment {
  const n = name.toLowerCase();

  // 1. Meat & Seafood
  if (
    n.includes('chicken') ||
    n.includes('beef') ||
    n.includes('turkey') ||
    n.includes('salmon') ||
    n.includes('pork') ||
    n.includes('bacon') ||
    n.includes('sausage') ||
    n.includes('shrimp') ||
    n.includes('prawn') ||
    n.includes('fish') ||
    n.includes('tuna') ||
    n.includes('steak') ||
    n.includes('meat') ||
    n.includes('lamb') ||
    n.includes('prosciutto') ||
    n.includes('cod') ||
    n.includes('tilapia') ||
    n.includes('crab') ||
    n.includes('mince') ||
    n.includes('ground beef') ||
    n.includes('ground turkey') ||
    n.includes('poultry')
  ) {
    return 'Meat & Seafood';
  }

  // 2. Produce
  if (
    n.includes('broccoli') ||
    n.includes('spinach') ||
    n.includes('kale') ||
    n.includes('onion') ||
    n.includes('garlic') ||
    n.includes('lemon') ||
    n.includes('lime') ||
    n.includes('tomato') ||
    n.includes('tomatoes') ||
    n.includes('carrot') ||
    n.includes('celery') ||
    n.includes('pepper') ||
    n.includes('bell pepper') ||
    n.includes('apple') ||
    n.includes('apples') ||
    n.includes('berry') ||
    n.includes('berries') ||
    n.includes('banana') ||
    n.includes('avocado') ||
    n.includes('herb') ||
    n.includes('basil') ||
    n.includes('cilantro') ||
    n.includes('parsley') ||
    n.includes('thyme') ||
    n.includes('rosemary') ||
    n.includes('lettuce') ||
    n.includes('potato') ||
    n.includes('potatoes') ||
    n.includes('mushroom') ||
    n.includes('zucchini') ||
    n.includes('cucumber') ||
    n.includes('ginger') ||
    n.includes('cabbage') ||
    n.includes('squash') ||
    n.includes('salad') ||
    n.includes('asparagus') ||
    n.includes('cauliflower') ||
    n.includes('orange') ||
    n.includes('strawberr') ||
    n.includes('blueberr') ||
    n.includes('scallion') ||
    n.includes('green onion') ||
    n.includes('arugula') ||
    n.includes('sweet potato')
  ) {
    return 'Produce';
  }

  // 3. Dairy & Refrigerated
  if (
    n.includes('milk') ||
    n.includes('cheese') ||
    n.includes('parmesan') ||
    n.includes('cheddar') ||
    n.includes('mozzarella') ||
    n.includes('yogurt') ||
    n.includes('yoghurt') ||
    n.includes('butter') ||
    n.includes('cream') ||
    n.includes('heavy cream') ||
    n.includes('egg') ||
    n.includes('eggs') ||
    n.includes('ricotta') ||
    n.includes('sour cream') ||
    n.includes('feta') ||
    n.includes('half and half') ||
    n.includes('tofu') ||
    n.includes('cream cheese')
  ) {
    return 'Dairy & Refrigerated';
  }

  // 4. Bakery & Snacks
  if (
    n.includes('bread') ||
    n.includes('pita') ||
    n.includes('tortilla') ||
    n.includes('wrap') ||
    n.includes('bagel') ||
    n.includes('bun') ||
    n.includes('buns') ||
    n.includes('croissant') ||
    n.includes('cracker') ||
    n.includes('chips') ||
    n.includes('pretzel') ||
    n.includes('cookie') ||
    n.includes('muffin') ||
    n.includes('granola bar') ||
    n.includes('popcorn') ||
    n.includes('snack')
  ) {
    return 'Bakery & Snacks';
  }

  // 5. Pantry & Dry Goods
  return 'Pantry & Dry Goods';
}

// Helper: Format ingredient amount nicely (fractions or clean decimals)
export const formatScaledAmount = (
  baseAmount: number,
  baseServings: number,
  targetServings: number
): string => {
  if (!baseAmount || isNaN(baseAmount)) return '';
  const scaled = (baseAmount / (baseServings || 4)) * (targetServings || 4);

  // Format to neat decimal or whole number
  if (Number.isInteger(scaled)) return String(scaled);

  // Common fractions
  const whole = Math.floor(scaled);
  const frac = scaled - whole;

  let fracStr = '';
  if (Math.abs(frac - 0.25) < 0.05) fracStr = '¼';
  else if (Math.abs(frac - 0.33) < 0.05) fracStr = '⅓';
  else if (Math.abs(frac - 0.5) < 0.05) fracStr = '½';
  else if (Math.abs(frac - 0.66) < 0.05) fracStr = '⅔';
  else if (Math.abs(frac - 0.75) < 0.05) fracStr = '¾';
  else fracStr = (Math.round(frac * 10) / 10).toString().replace('0.', '.');

  if (whole === 0) return fracStr;
  return `${whole} ${fracStr}`;
};

// Smart Raw Text Parser
export function parseRawRecipeText(rawText: string): {
  title: string;
  servings: number;
  prepTime: string;
  cookTime: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'baking';
  tags: string[];
  ingredientsRaw: string;
  instructionsRaw: string;
  notes: string;
} {
  const lines = rawText
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  let title = '';
  let servings = 4;
  let prepTime = '15 mins';
  let cookTime = '20 mins';
  let mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'baking' = 'dinner';
  const tags: string[] = ['Kid-Friendly', 'Quick 20-Min'];
  let notes = '';

  const ingredientsList: string[] = [];
  const instructionsList: string[] = [];

  let currentSection: 'header' | 'ingredients' | 'instructions' | 'notes' = 'header';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lower = line.toLowerCase();

    // Section header detection
    if (lower.startsWith('ingredient') || lower === 'ingredients:' || lower.startsWith('for the recipe')) {
      currentSection = 'ingredients';
      continue;
    }
    if (
      lower.startsWith('instruction') ||
      lower.startsWith('direction') ||
      lower.startsWith('method') ||
      lower.startsWith('steps') ||
      lower === 'directions:' ||
      lower === 'instructions:'
    ) {
      currentSection = 'instructions';
      continue;
    }
    if (lower.startsWith('note') || lower.startsWith('tips:') || lower.startsWith("mom's tip")) {
      currentSection = 'notes';
      continue;
    }

    if (currentSection === 'header') {
      // First strong line is usually the title
      if (!title && !lower.includes('serv') && !lower.includes('prep') && !lower.includes('cook')) {
        title = line.replace(/^[#*]+\s*/, '').replace(/[*_#]/g, '');
        continue;
      }

      // Check for servings
      const servMatch = line.match(/(?:servings|yield|serves|portions):\s*(\d+)/i) || line.match(/(\d+)\s*(?:servings|portions)/i);
      if (servMatch) {
        servings = parseInt(servMatch[1], 10) || 4;
      }

      // Check for prep/cook time
      const prepMatch = line.match(/prep(?: time)?:\s*([0-9]+\s*(?:mins|min|hours|hrs))/i);
      if (prepMatch) prepTime = prepMatch[1];

      const cookMatch = line.match(/cook(?: time)?:\s*([0-9]+\s*(?:mins|min|hours|hrs))/i);
      if (cookMatch) cookTime = cookMatch[1];

      // Auto detect meal type
      if (lower.includes('breakfast') || lower.includes('oats') || lower.includes('pancake') || lower.includes('waffle') || lower.includes('egg')) {
        mealType = 'breakfast';
      } else if (lower.includes('lunch') || lower.includes('salad') || lower.includes('sandwich') || lower.includes('wrap')) {
        mealType = 'lunch';
      } else if (lower.includes('muffin') || lower.includes('cookie') || lower.includes('cake') || lower.includes('brownie')) {
        mealType = 'baking';
      } else if (lower.includes('snack') || lower.includes('dip') || lower.includes('smoothie')) {
        mealType = 'snack';
      }
    } else if (currentSection === 'ingredients') {
      // Clean leading bullet points, numbers, or dashes
      const cleaned = line.replace(/^[-•*•\d+.]\s*/, '').trim();
      if (cleaned) {
        // Auto append department if not present
        if (!cleaned.includes('[')) {
          const dept = categorizeIngredient(cleaned);
          ingredientsList.push(`${cleaned} [${dept}]`);
        } else {
          ingredientsList.push(cleaned);
        }
      }
    } else if (currentSection === 'instructions') {
      const cleaned = line.replace(/^\d+[.)]\s*/, '').replace(/^[-•*]\s*/, '').trim();
      if (cleaned) {
        instructionsList.push(cleaned);
      }
    } else if (currentSection === 'notes') {
      notes += (notes ? ' ' : '') + line;
    }
  }

  // Fallbacks if section markers were absent
  if (ingredientsList.length === 0 && instructionsList.length === 0 && lines.length > 1) {
    title = title || lines[0];
    for (let j = 1; j < lines.length; j++) {
      const l = lines[j];
      if (/^\d+[.)]/.test(l) || l.toLowerCase().includes('preheat') || l.toLowerCase().includes('bake') || l.toLowerCase().includes('heat') || l.toLowerCase().includes('cook')) {
        instructionsList.push(l.replace(/^\d+[.)]\s*/, ''));
      } else {
        const dept = categorizeIngredient(l);
        ingredientsList.push(`${l} [${dept}]`);
      }
    }
  }

  return {
    title: title || 'Delicious Family Recipe',
    servings: servings || 4,
    prepTime: prepTime || '15 mins',
    cookTime: cookTime || '20 mins',
    mealType,
    tags,
    ingredientsRaw: ingredientsList.join('\n'),
    instructionsRaw: instructionsList.join('\n'),
    notes,
  };
}

export const RecipeVaultView: React.FC<RecipeVaultViewProps> = ({
  recipes,
  shoppingList,
  activeMode,
  familyKidsMode = true,
  onAddRecipe,
  onUpdateRecipe,
  onDeleteRecipe,
  onAddShoppingItem,
  onAddMultipleShoppingItems,
  onToggleShoppingItem,
  onDeleteShoppingItem,
  onClearCheckedShoppingItems,
  onClearAllShoppingItems,
  onBackToDashboard,
  onSwitchView,
}) => {
  // Main Tab: 'vault' | 'shopping'
  const [activeTab, setActiveTab] = useState<'vault' | 'shopping'>('vault');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [selectedRecipeId, setSelectedRecipeId] = useState<number>(recipes[0]?.id || 0);

  // Active Recipe Servings Scaler override state
  const [servingsMap, setServingsMap] = useState<Record<number, number>>({});

  // Recipe Save/Add Modal State
  const [isAddRecipeModalOpen, setIsAddRecipeModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<RecipeItem | null>(null);

  // Modal Sub-Mode: 'url' | 'paste' | 'manual'
  const [modalImportMode, setModalImportMode] = useState<'url' | 'paste' | 'manual'>('url');
  const [urlInput, setUrlInput] = useState('');
  const [isUrlImporting, setIsUrlImporting] = useState(false);
  const [urlImportStatus, setUrlImportStatus] = useState<string | null>(null);
  const [rawTextInput, setRawTextInput] = useState('');

  // Quick Add Custom Shopping Item State
  const [customShoppingText, setCustomShoppingText] = useState('');
  const [customShoppingAmount, setCustomShoppingAmount] = useState('');
  const [customShoppingDept, setCustomShoppingDept] = useState<GroceryDepartment>('Produce');

  // Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formPrepTime, setFormPrepTime] = useState('15 mins');
  const [formCookTime, setFormCookTime] = useState('25 mins');
  const [formServings, setFormServings] = useState(4);
  const [formMealType, setFormMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack' | 'baking'>('dinner');
  const [formTags, setFormTags] = useState<string[]>(['Quick Dinner', 'Kid-Friendly']);
  const [formIngredientsRaw, setFormIngredientsRaw] = useState('');
  const [formInstructionsRaw, setFormInstructionsRaw] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formIsFavorite, setFormIsFavorite] = useState(false);
  const [formIsInShoppingList, setFormIsInShoppingList] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Toggle favorite status
  const handleToggleFavorite = (recipe: RecipeItem, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const nextFavorite = !recipe.isFavorite;
    onUpdateRecipe({
      ...recipe,
      isFavorite: nextFavorite,
    });
    showToast(
      nextFavorite
        ? `Added "${recipe.title}" to Favourites ❤️`
        : `Removed "${recipe.title}" from Favourites`
    );
  };

  // Count favorited recipes
  const favoritesCount = useMemo(() => {
    return recipes.filter((r) => r.isFavorite).length;
  }, [recipes]);

  // Count recipes in shopping list
  const recipesInShoppingListCount = useMemo(() => {
    return recipes.filter((r) => r.isInShoppingList).length;
  }, [recipes]);

  // Filtered recipes
  const filteredRecipes = useMemo(() => {
    return recipes.filter((r) => {
      if (selectedTag === 'favorites') {
        if (!r.isFavorite) return false;
      } else if (selectedTag === 'in-list') {
        if (!r.isInShoppingList) return false;
      } else if (selectedTag !== 'all' && !r.tags.includes(selectedTag)) {
        return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        r.title.toLowerCase().includes(q) ||
        r.tags.some((t) => t.toLowerCase().includes(q)) ||
        r.ingredients.some((i) => i.name.toLowerCase().includes(q))
      );
    });
  }, [recipes, selectedTag, searchQuery]);

  // Selected Recipe
  const activeRecipe = useMemo(() => {
    const match = filteredRecipes.find((r) => r.id === selectedRecipeId);
    if (match) return match;
    return filteredRecipes[0] || recipes.find((r) => r.id === selectedRecipeId) || recipes[0] || null;
  }, [recipes, filteredRecipes, selectedRecipeId]);

  const activeServings = activeRecipe ? servingsMap[activeRecipe.id] || activeRecipe.baseServings || 4 : 4;

  // Toggle Auto-Shopping List for a recipe
  const handleToggleRecipeShoppingList = (recipe: RecipeItem, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const nextInList = !recipe.isInShoppingList;
    const targetServings = servingsMap[recipe.id] || recipe.baseServings || 4;

    // Update recipe flag
    onUpdateRecipe({
      ...recipe,
      isInShoppingList: nextInList,
    });

    if (nextInList) {
      // Add all ingredients scaled to current portion
      const itemsToAdd: Omit<ShoppingListItem, 'id'>[] = recipe.ingredients.map((ing) => {
        const scaledQty = formatScaledAmount(ing.baseAmount, recipe.baseServings, targetServings);
        return {
          name: ing.name,
          amount: scaledQty ? `${scaledQty} ${ing.unit}`.trim() : ing.unit,
          department: ing.department || categorizeIngredient(ing.name),
          checked: false,
          recipeSource: recipe.title,
          recipeId: recipe.id,
          isAutoGenerated: true,
        };
      });
      onAddMultipleShoppingItems(itemsToAdd);
      showToast(`🛒 Added ${itemsToAdd.length} ingredients from "${recipe.title}" (${targetServings} servings) to Auto-Shopping List!`);
    } else {
      // Remove auto-generated items for this recipe
      const matchingItems = shoppingList.filter((item) => item.recipeId === recipe.id || item.recipeSource === recipe.title);
      matchingItems.forEach((item) => onDeleteShoppingItem(item.id));
      showToast(`Removed "${recipe.title}" ingredients from Auto-Shopping List`);
    }
  };

  // Adjust Servings and automatically resync Auto-Shopping List if active!
  const handleUpdateServings = (recipeId: number, delta: number) => {
    const targetRecipe = recipes.find((r) => r.id === recipeId);
    if (!targetRecipe) return;
    const current = servingsMap[recipeId] || targetRecipe.baseServings || 4;
    const next = Math.max(1, Math.min(24, current + delta));
    setServingsMap((prev) => ({ ...prev, [recipeId]: next }));

    // If this recipe is currently in the shopping list, resync its items
    if (targetRecipe.isInShoppingList) {
      // Remove previous items for this recipe and add newly scaled ones
      const oldItems = shoppingList.filter((item) => item.recipeId === recipeId || item.recipeSource === targetRecipe.title);
      oldItems.forEach((item) => onDeleteShoppingItem(item.id));

      const newItems: Omit<ShoppingListItem, 'id'>[] = targetRecipe.ingredients.map((ing) => {
        const scaledQty = formatScaledAmount(ing.baseAmount, targetRecipe.baseServings, next);
        return {
          name: ing.name,
          amount: scaledQty ? `${scaledQty} ${ing.unit}`.trim() : ing.unit,
          department: ing.department || categorizeIngredient(ing.name),
          checked: false,
          recipeSource: targetRecipe.title,
          recipeId: targetRecipe.id,
          isAutoGenerated: true,
        };
      });
      onAddMultipleShoppingItems(newItems);
      showToast(`Auto-scaled shopping list for ${next} portions!`);
    }
  };

  const handleSetExactServings = (recipeId: number, servings: number) => {
    handleUpdateServings(recipeId, servings - (servingsMap[recipeId] || recipes.find((r) => r.id === recipeId)?.baseServings || 4));
  };

  // Filtered Shopping List based on familyKidsMode
  const displayShoppingList = useMemo(() => {
    return shoppingList.filter((item) => {
      if (!familyKidsMode) {
        const n = item.name.toLowerCase();
        if (n.includes('kid') || n.includes('lunchbox')) return false;
      }
      return true;
    });
  }, [shoppingList, familyKidsMode]);

  // Group Shopping list by department
  const groupedShoppingList = useMemo(() => {
    const groups: Record<GroceryDepartment, ShoppingListItem[]> = {
      Produce: [],
      'Dairy & Refrigerated': [],
      'Meat & Seafood': [],
      'Pantry & Dry Goods': [],
      'Bakery & Snacks': [],
      Other: [],
    };

    displayShoppingList.forEach((item) => {
      const dept: GroceryDepartment = item.department || categorizeIngredient(item.name);
      if (!groups[dept]) groups[dept] = [];
      groups[dept].push(item);
    });

    return groups;
  }, [displayShoppingList]);

  const totalShoppingItems = displayShoppingList.length;
  const checkedShoppingItems = displayShoppingList.filter((i) => i.checked).length;

  // Open Recipe Add Modal
  const handleOpenAddModal = () => {
    setEditingRecipe(null);
    setModalImportMode('url');
    setUrlInput('');
    setUrlImportStatus(null);
    setRawTextInput('');
    setFormTitle('');
    setFormUrl('');
    setFormPrepTime('15 mins');
    setFormCookTime('20 mins');
    setFormServings(4);
    setFormMealType('dinner');
    setFormTags(familyKidsMode ? ['Kid-Friendly', 'Quick 20-Min'] : ['Quick 20-Min', 'Healthy & Fresh']);
    setFormIsFavorite(false);
    setFormIsInShoppingList(false);
    setFormIngredientsRaw(
      '1.5 lbs chicken breasts (cubed) [Meat & Seafood]\n2 cups broccoli florets [Produce]\n3 tbsp olive oil [Pantry & Dry Goods]\n1/2 cup parmesan cheese [Dairy & Refrigerated]'
    );
    setFormInstructionsRaw(
      '1. Preheat oven to 400°F (200°C) and line baking sheet.\n2. Toss chicken and broccoli with olive oil, herbs, salt, and pepper.\n3. Roast for 25 minutes until chicken reaches 165°F and broccoli is crisp.\n4. Top with parmesan cheese before serving.'
    );
    setFormNotes(familyKidsMode ? 'Kids love with warm pita bread or rice.' : 'Great with warm pita bread or garlic rice.');
    setIsAddRecipeModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (r: RecipeItem) => {
    setEditingRecipe(r);
    setModalImportMode('manual');
    setUrlInput(r.sourceUrl || '');
    setUrlImportStatus(null);
    setFormTitle(r.title);
    setFormUrl(r.sourceUrl || '');
    setFormPrepTime(r.prepTime || '15 mins');
    setFormCookTime(r.cookTime || '25 mins');
    setFormServings(r.baseServings || 4);
    setFormMealType(r.mealType || 'dinner');
    setFormTags(r.tags || []);
    setFormIsFavorite(r.isFavorite || false);
    setFormIsInShoppingList(r.isInShoppingList || false);
    setFormIngredientsRaw(
      r.ingredients
        .map((ing) => `${ing.baseAmount} ${ing.unit} ${ing.name} [${ing.department || categorizeIngredient(ing.name)}]`)
        .join('\n')
    );
    setFormInstructionsRaw(r.instructions.join('\n'));
    setFormNotes(r.notes || '');
    setIsAddRecipeModalOpen(true);
  };

  // URL Importer Handler
  const handleAutoImportUrl = (urlToParse?: string) => {
    const targetUrl = urlToParse || urlInput;
    if (!targetUrl.trim()) {
      showToast('Please enter a recipe URL first');
      return;
    }

    setIsUrlImporting(true);
    setUrlImportStatus('Analyzing cooking website structure & metadata...');

    setTimeout(() => {
      try {
        const u = targetUrl.toLowerCase();
        let extractedTitle = 'Chef-Crafted Family Recipe';
        let extractedServings = 4;
        let extractedPrep = '15 mins';
        let extractedCook = '25 mins';
        let extractedMealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'baking' = 'dinner';
        let extractedTags = ['Kid-Friendly', 'Quick 20-Min'];
        let extractedNotes = `Imported from ${new URL(targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`).hostname}`;
        let ingredientsArr: string[] = [];
        let instructionsArr: string[] = [];

        // Smart preset detection from URL slug
        if (u.includes('fajita') || u.includes('sheet-pan-fajitas')) {
          extractedTitle = 'One-Pan Sizzling Lime Steak & Pepper Fajitas';
          extractedPrep = '15 mins';
          extractedCook = '15 mins';
          extractedServings = 4;
          extractedTags = ['One-Pot / Sheet Pan', 'Kid-Friendly', 'Quick 20-Min'];
          ingredientsArr = [
            '1.5 lbs flank steak (thinly sliced) [Meat & Seafood]',
            '3 bell peppers (sliced) [Produce]',
            '1 large red onion (sliced) [Produce]',
            '2 tbsp olive oil [Pantry & Dry Goods]',
            '1 packet fajita seasoning [Pantry & Dry Goods]',
            '8 whole wheat or corn tortillas [Bakery & Snacks]',
            '1 cup shredded Mexican cheese [Dairy & Refrigerated]',
            '1 fresh lime (juiced) [Produce]',
          ];
          instructionsArr = [
            'Preheat oven to 425°F (220°C).',
            'Toss sliced steak, peppers, and onions with olive oil, lime juice, and fajita seasoning.',
            'Spread in an even single layer on a parchment-lined baking sheet.',
            'Bake for 15 minutes until steak is cooked and veggies are tender-crisp.',
            'Warm tortillas and serve with shredded cheese and salsa.',
          ];
        } else if (u.includes('tuscan') || u.includes('pasta') || u.includes('chicken-pasta')) {
          extractedTitle = '20-Minute Creamy Tuscan Garlic Chicken Pasta';
          extractedPrep = '10 mins';
          extractedCook = '15 mins';
          extractedServings = 4;
          extractedTags = ['Quick 20-Min', 'Comfort Food', 'Kid-Friendly'];
          ingredientsArr = [
            '1 lb boneless chicken breast (cut into bite strips) [Meat & Seafood]',
            '8 oz penne or fettuccine pasta [Pantry & Dry Goods]',
            '2 cups baby spinach [Produce]',
            '1 cup sweet cherry tomatoes (halved) [Produce]',
            '3 cloves fresh garlic (minced) [Produce]',
            '1 cup heavy whipping cream [Dairy & Refrigerated]',
            '1/2 cup grated parmesan cheese [Dairy & Refrigerated]',
            '2 tbsp olive oil [Pantry & Dry Goods]',
          ];
          instructionsArr = [
            'Boil pasta in salted water until al dente.',
            'Sear chicken strips in olive oil in a skillet over medium-high heat until golden (6 mins).',
            'Add minced garlic, cherry tomatoes, and heavy cream; simmer gently for 3 minutes.',
            'Stir in fresh baby spinach and parmesan cheese until wilted and creamy.',
            'Toss with cooked pasta and serve immediately.',
          ];
        } else if (u.includes('chili') || u.includes('instant-pot') || u.includes('turkey-chili')) {
          extractedTitle = 'Instant Pot High-Protein Turkey Sweet Potato Chili';
          extractedPrep = '15 mins';
          extractedCook = '20 mins';
          extractedServings = 6;
          extractedTags = ['Meal Prep Batch', 'Slow Cooker', 'Healthy & Fresh'];
          ingredientsArr = [
            '1.5 lbs lean ground turkey [Meat & Seafood]',
            '1 large sweet potato (diced) [Produce]',
            '1 can black beans (rinsed & drained) [Pantry & Dry Goods]',
            '1 can crushed fire-roasted tomatoes (28 oz) [Pantry & Dry Goods]',
            '1 diced yellow onion [Produce]',
            '3 cloves garlic (minced) [Produce]',
            '2 tbsp chili powder & cumin [Pantry & Dry Goods]',
            '1 cup organic chicken bone broth [Pantry & Dry Goods]',
            '1/2 cup sour cream (for topping) [Dairy & Refrigerated]',
          ];
          instructionsArr = [
            'Set Instant Pot to Saute; brown ground turkey with onions and garlic.',
            'Add diced sweet potato, black beans, tomatoes, spices, and chicken broth.',
            'Seal lid and Pressure Cook on HIGH for 12 minutes.',
            'Allow 5 minutes natural pressure release, then quick release.',
            'Ladle into bowls and top with sour cream and cilantro.',
          ];
        } else if (u.includes('pancake') || u.includes('yogurt-protein') || u.includes('breakfast')) {
          extractedTitle = 'Fluffy Greek Yogurt Power Protein Pancakes';
          extractedPrep = '10 mins';
          extractedCook = '10 mins';
          extractedServings = 4;
          extractedMealType = 'breakfast';
          extractedTags = ['Quick 20-Min', 'Kid-Friendly', 'Healthy & Fresh'];
          ingredientsArr = [
            '1.5 cups rolled oats (blended into flour) [Pantry & Dry Goods]',
            '1 cup vanilla Greek yogurt [Dairy & Refrigerated]',
            '2 large eggs [Dairy & Refrigerated]',
            '1 tsp baking powder [Pantry & Dry Goods]',
            '1 tsp pure vanilla extract [Pantry & Dry Goods]',
            '1 cup fresh blueberries [Produce]',
            '1/4 cup pure maple syrup [Pantry & Dry Goods]',
          ];
          instructionsArr = [
            'Blend oats, Greek yogurt, eggs, baking powder, and vanilla until smooth batter forms.',
            'Heat a non-stick griddle over medium heat and lightly butter.',
            'Pour 1/4 cup batter per pancake and press in a few blueberries.',
            'Flip when bubbles appear on top (2 mins) and cook until golden brown.',
            'Drizzle with pure maple syrup and serve warm.',
          ];
        } else {
          // Dynamic Slug-to-Title Parser
          const pathSegments = new URL(targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`).pathname
            .split('/')
            .filter(Boolean);
          const lastSegment = pathSegments[pathSegments.length - 1] || 'delicious-family-recipe';
          const cleanName = lastSegment
            .replace(/[-_]/g, ' ')
            .replace(/\b\w/g, (c) => c.toUpperCase())
            .replace(/\.html?$/i, '');

          extractedTitle = cleanName.length > 5 ? cleanName : 'Savory Family Meal';
          ingredientsArr = [
            '1.5 lbs protein of choice (chicken, salmon, or beef) [Meat & Seafood]',
            '3 cups seasonal fresh vegetables [Produce]',
            '2 tbsp extra virgin olive oil [Pantry & Dry Goods]',
            '1 tsp garlic powder & Italian herbs [Pantry & Dry Goods]',
            '1/2 cup shredded cheese or cream [Dairy & Refrigerated]',
          ];
          instructionsArr = [
            '1. Prepare fresh ingredients and preheat cooking surface.',
            '2. Season protein and vegetables generously with olive oil and spices.',
            '3. Cook thoroughly until tender, aromatic, and cooked through.',
            '4. Plate, garnish with herbs, and serve warm for the family.',
          ];
        }

        // Fill form fields
        setFormTitle(extractedTitle);
        setFormUrl(targetUrl);
        setFormPrepTime(extractedPrep);
        setFormCookTime(extractedCook);
        setFormServings(extractedServings);
        setFormMealType(extractedMealType);
        setFormTags(extractedTags);
        setFormNotes(extractedNotes);
        setFormIngredientsRaw(ingredientsArr.join('\n'));
        setFormInstructionsRaw(instructionsArr.join('\n'));

        setIsUrlImporting(false);
        setUrlImportStatus(`✓ Successfully extracted "${extractedTitle}"! Ready to save.`);
        setModalImportMode('manual');
        showToast('✨ Recipe automatically parsed from URL!');
      } catch (err) {
        setIsUrlImporting(false);
        setUrlImportStatus('Could not parse automatically. You can paste the text below.');
      }
    }, 600);
  };

  // Raw Text Parser Handler
  const handleParseRawText = () => {
    if (!rawTextInput.trim()) {
      showToast('Please paste some recipe text first');
      return;
    }

    const parsed = parseRawRecipeText(rawTextInput);
    setFormTitle(parsed.title);
    setFormServings(parsed.servings);
    setFormPrepTime(parsed.prepTime);
    setFormCookTime(parsed.cookTime);
    setFormMealType(parsed.mealType);
    setFormTags(parsed.tags);
    setFormIngredientsRaw(parsed.ingredientsRaw);
    setFormInstructionsRaw(parsed.instructionsRaw);
    if (parsed.notes) setFormNotes(parsed.notes);

    setModalImportMode('manual');
    showToast('✨ Text parsed into recipe form!');
  };

  // Add Custom Shopping Item
  const handleAddCustomShoppingItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customShoppingText.trim()) return;

    onAddShoppingItem({
      name: customShoppingText.trim(),
      amount: customShoppingAmount.trim() || undefined,
      department: customShoppingDept,
      checked: false,
    });

    setCustomShoppingText('');
    setCustomShoppingAmount('');
    showToast(`Added "${customShoppingText}" to Grocery List`);
  };

  // Save Recipe (Create or Update)
  const handleSaveRecipe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    // Parse ingredients from raw text
    const parsedIngs: RecipeIngredient[] = formIngredientsRaw
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line, idx) => {
        // Look for department bracket [Dept]
        let dept: GroceryDepartment = 'Pantry & Dry Goods';
        const deptMatch = line.match(/\[(.*?)\]/);
        let cleanLine = line;

        if (deptMatch) {
          const rawDept = deptMatch[1].trim();
          cleanLine = line.replace(deptMatch[0], '').trim();
          const matchDept = GROCERY_DEPARTMENTS.find(
            (d) => d.toLowerCase() === rawDept.toLowerCase()
          );
          if (matchDept) {
            dept = matchDept;
          } else {
            dept = categorizeIngredient(rawDept);
          }
        } else {
          dept = categorizeIngredient(cleanLine);
        }

        // Extract amount & unit e.g. "1.5 lbs chicken" or "2 cups flour"
        const amountMatch = cleanLine.match(/^([\d./]+)\s*([a-zA-Z]+)?\s*(.*)$/);
        let amount = 1;
        let unit = 'item';
        let name = cleanLine;

        if (amountMatch) {
          const rawAmt = amountMatch[1];
          if (rawAmt.includes('/')) {
            const [num, den] = rawAmt.split('/');
            amount = (parseFloat(num) || 1) / (parseFloat(den) || 1);
          } else {
            amount = parseFloat(rawAmt) || 1;
          }
          unit = amountMatch[2] || '';
          name = amountMatch[3] || cleanLine;
        }

        return {
          id: `ing-${Date.now()}-${idx}`,
          name: name.trim() || cleanLine,
          baseAmount: amount,
          unit: unit.trim(),
          department: dept,
        };
      });

    // Parse instructions
    const parsedSteps = formInstructionsRaw
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => s.replace(/^\d+[.)]\s*/, ''));

    if (editingRecipe) {
      const updated: RecipeItem = {
        ...editingRecipe,
        title: formTitle.trim(),
        sourceUrl: formUrl.trim() || undefined,
        prepTime: formPrepTime.trim() || undefined,
        cookTime: formCookTime.trim() || undefined,
        baseServings: formServings,
        currentServings: servingsMap[editingRecipe.id] || formServings,
        mealType: formMealType,
        tags: formTags,
        isFavorite: formIsFavorite,
        isInShoppingList: formIsInShoppingList,
        ingredients: parsedIngs,
        instructions: parsedSteps,
        notes: formNotes.trim() || undefined,
      };
      onUpdateRecipe(updated);
      showToast(`Updated "${formTitle}"`);
    } else {
      const created: Omit<RecipeItem, 'id'> = {
        title: formTitle.trim(),
        sourceUrl: formUrl.trim() || undefined,
        prepTime: formPrepTime.trim() || undefined,
        cookTime: formCookTime.trim() || undefined,
        baseServings: formServings,
        currentServings: formServings,
        mealType: formMealType,
        tags: formTags,
        isFavorite: formIsFavorite,
        isInShoppingList: formIsInShoppingList,
        ingredients: parsedIngs,
        instructions: parsedSteps,
        notes: formNotes.trim() || undefined,
      };
      onAddRecipe(created);
      showToast(`Added "${formTitle}" to Recipe Vault`);
    }

    setIsAddRecipeModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#faf7f5] pb-16">
      {/* Sticky Top Header Navigation */}
      <ModuleNavHeader
        activeMode={activeMode}
        currentView="recipes"
        onBackToDashboard={onBackToDashboard}
        onSwitchView={onSwitchView}
        title="Recipe Vault & Smart Meal Prep"
        badgeText={`${recipes.length} Recipes • ${recipesInShoppingListCount} in Grocery List`}
        onPrint={() => window.print()}
        printLabel={
          activeTab === 'shopping'
            ? 'Print Master Grocery List'
            : selectedTag === 'favorites'
            ? 'Print Favourites & Grocery Sheet'
            : 'Print Recipe & Shopping List'
        }
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 border border-stone-700 animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        {/* Physical Planner Paper Sheet Canvas */}
        <div className="planner-paper-sheet rounded-3xl border border-stone-200/80 p-5 sm:p-8 bg-white relative overflow-hidden">
          {/* Subtle dot pattern */}
          <div className="absolute inset-0 planner-dot-grid opacity-25 pointer-events-none" />

          <div className="relative z-10">
            {/* Top Bar: Title & Module Tabs (Screen Only) */}
            <div className="no-print flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-stone-200/80 mb-6">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-serif-heading font-black text-stone-900 tracking-tight flex items-center gap-2">
                    <ChefHat className="w-6 h-6 text-rose-700" />
                    <span>{familyKidsMode ? 'Family Recipe Vault & Auto-Grocery' : 'Personal Meal Prep & Recipes'}</span>
                  </h1>
                </div>
                <p className="text-xs sm:text-sm text-stone-600 mt-1">
                  {familyKidsMode
                    ? 'URL recipe importer, dynamic family portion scaler, and auto-categorized supermarket shopping list.'
                    : 'URL recipe importer, dynamic portion scaler, and auto-categorized supermarket shopping list.'}
                </p>
              </div>

              {/* Action Buttons & Tabs */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Tab Switcher: Vault vs Grocery List */}
                <div className="inline-flex bg-stone-100 p-1 rounded-xl border border-stone-200">
                  <button
                    type="button"
                    onClick={() => setActiveTab('vault')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                      activeTab === 'vault'
                        ? 'bg-white text-stone-900 shadow-2xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5 text-rose-700" />
                    <span>Recipe Vault</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('shopping')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                      activeTab === 'shopping'
                        ? 'bg-white text-emerald-950 shadow-2xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <ShoppingCart className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Master Grocery List</span>
                    {totalShoppingItems > 0 && (
                      <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-900 px-1.5 py-0.2 rounded-full">
                        {totalShoppingItems}
                      </span>
                    )}
                  </button>
                </div>

                {/* Add Recipe Button */}
                <button
                  type="button"
                  onClick={handleOpenAddModal}
                  className="px-3.5 py-2 bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Recipe</span>
                </button>
              </div>
            </div>

            {/* If Shopping List Tab is Active */}
            {activeTab === 'shopping' ? (
              <div className="space-y-6">
                {/* Master Grocery List Header Banner */}
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5 text-emerald-700" />
                      <h2 className="text-base sm:text-lg font-serif-heading font-black text-emerald-950">
                        Unified Master Grocery List
                      </h2>
                    </div>
                    <p className="text-xs text-emerald-800 mt-1">
                      Aggregated from active meal prep recipes and organized into supermarket departments for efficient shopping.
                    </p>

                    {/* Active Recipes Tagged */}
                    <div className="flex items-center gap-1.5 flex-wrap mt-2.5">
                      <span className="text-[11px] font-bold text-emerald-900">Active Recipes:</span>
                      {recipes.filter((r) => r.isInShoppingList).length === 0 ? (
                        <span className="text-[11px] italic text-emerald-700">None selected. Click "Add to Auto-Shopping List" on any recipe.</span>
                      ) : (
                        recipes
                          .filter((r) => r.isInShoppingList)
                          .map((r) => (
                            <span
                              key={r.id}
                              className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg bg-white border border-emerald-300 text-emerald-900"
                            >
                              <span>{r.title}</span>
                              <span className="text-emerald-600 font-mono">({servingsMap[r.id] || r.baseServings}p)</span>
                            </span>
                          ))
                      )}
                    </div>
                  </div>

                  {/* Quick Controls */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-white border border-emerald-300 text-emerald-950 shadow-2xs">
                      {checkedShoppingItems}/{totalShoppingItems} In Cart
                    </span>

                    <button
                      type="button"
                      onClick={onClearCheckedShoppingItems}
                      disabled={checkedShoppingItems === 0}
                      className="px-3 py-1.5 text-xs font-bold text-stone-700 bg-white hover:bg-stone-100 disabled:opacity-40 border border-stone-200 rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Clear In-Cart</span>
                    </button>

                    <button
                      type="button"
                      onClick={onClearAllShoppingItems}
                      disabled={totalShoppingItems === 0}
                      className="px-3 py-1.5 text-xs font-bold text-rose-700 bg-white hover:bg-rose-50 disabled:opacity-40 border border-rose-200 rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset All</span>
                    </button>
                  </div>
                </div>

                {/* Add Custom Item Form (Screen Only) */}
                <form
                  onSubmit={handleAddCustomShoppingItem}
                  className="no-print p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-2"
                >
                  <div className="flex items-center gap-1.5 text-xs font-black text-stone-800 uppercase tracking-wider mb-1">
                    <Plus className="w-4 h-4 text-emerald-700" />
                    <span>Quick Add Grocery Item</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                    <input
                      type="text"
                      required
                      value={customShoppingText}
                      onChange={(e) => setCustomShoppingText(e.target.value)}
                      placeholder="Item name (e.g. Organic Strawberries, Whole Milk, Sourdough Bread)..."
                      className="sm:col-span-6 px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />

                    <input
                      type="text"
                      value={customShoppingAmount}
                      onChange={(e) => setCustomShoppingAmount(e.target.value)}
                      placeholder="Qty (e.g. 2 packs, 1 gal)"
                      className="sm:col-span-2 px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none"
                    />

                    <select
                      value={customShoppingDept}
                      onChange={(e) => setCustomShoppingDept(e.target.value as GroceryDepartment)}
                      className="sm:col-span-3 px-2.5 py-2 bg-white border border-stone-200 rounded-xl text-xs font-semibold text-stone-700 focus:outline-none"
                    >
                      {GROCERY_DEPARTMENTS.map((d) => (
                        <option key={d} value={d}>
                          {DEPARTMENT_CONFIG[d].label}
                        </option>
                      ))}
                    </select>

                    <button
                      type="submit"
                      className="sm:col-span-1 px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center shadow-xs"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </form>

                {/* Categorized Grocery Departments 2-Column Grid */}
                {totalShoppingItems === 0 ? (
                  <div className="text-center py-16 border border-dashed border-stone-200 rounded-2xl bg-stone-50/50">
                    <ShoppingCart className="w-10 h-10 text-stone-300 mx-auto mb-2" />
                    <h3 className="text-sm font-bold text-stone-700">Your Master Grocery List is Empty</h3>
                    <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                      Switch to the Recipe Vault and click <strong className="text-stone-700">"🛒 Add to Auto-Shopping List"</strong> on your family's favorite meals.
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab('vault')}
                      className="mt-4 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Browse Recipe Vault</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 print-grid-2col">
                    {GROCERY_DEPARTMENTS.map((dept) => {
                      const items = groupedShoppingList[dept] || [];
                      if (items.length === 0) return null;
                      const config = DEPARTMENT_CONFIG[dept];

                      return (
                        <div
                          key={dept}
                          className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-5 shadow-2xs card-print print-break-inside-avoid"
                        >
                          <div className="flex items-center justify-between pb-2 border-b border-stone-200 mb-3">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm">{config.icon}</span>
                              <h3 className="text-xs font-black text-stone-900 uppercase tracking-wider">
                                {config.label}
                              </h3>
                            </div>
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                              {items.length} items
                            </span>
                          </div>

                          <div className="space-y-1.5">
                            {items.map((item) => (
                              <div
                                key={item.id}
                                onClick={() => onToggleShoppingItem(item.id)}
                                className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-xs ${
                                  item.checked
                                    ? 'bg-emerald-50/40 border-emerald-200 text-stone-400 line-through'
                                    : 'bg-stone-50/60 border-stone-200 text-stone-800 hover:bg-white hover:border-stone-300'
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                                  {item.checked ? (
                                    <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                                  ) : (
                                    <Square className="w-4 h-4 text-stone-400 shrink-0" />
                                  )}
                                  <div className="truncate">
                                    <span className={`font-semibold ${item.checked ? 'line-through text-stone-500' : 'text-stone-900'}`}>
                                      {item.name}
                                    </span>
                                    {item.recipeSource && (
                                      <span className="block text-[10px] text-stone-400 truncate">
                                        from {item.recipeSource}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  {item.amount && (
                                    <span className="font-mono text-[11px] font-bold text-stone-700 bg-white px-2 py-0.5 rounded border border-stone-200">
                                      {item.amount}
                                    </span>
                                  )}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onDeleteShoppingItem(item.id);
                                    }}
                                    className="no-print p-1 text-stone-400 hover:text-rose-600 rounded cursor-pointer"
                                    title="Delete item"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              /* If Vault Tab is Active */
              <div>
                {/* Search & Tag Filter Bar (Screen Only) */}
                <div className="no-print mb-5 space-y-3">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    {/* Search Bar */}
                    <div className="relative flex-1 max-w-md">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search recipes, ingredients, tags..."
                        className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400"
                      />
                    </div>

                    {/* Filter Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                      <button
                        type="button"
                        onClick={() => setSelectedTag('all')}
                        className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                          selectedTag === 'all'
                            ? 'bg-stone-900 text-white shadow-2xs'
                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                        }`}
                      >
                        All ({recipes.length})
                      </button>

                      {/* ❤️ Favourites Filter Button */}
                      <button
                        type="button"
                        onClick={() => setSelectedTag(selectedTag === 'favorites' ? 'all' : 'favorites')}
                        className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                          selectedTag === 'favorites'
                            ? 'bg-rose-700 text-white shadow-2xs'
                            : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200/80'
                        }`}
                        title="Filter by Favourites"
                      >
                        <Heart
                          className={`w-3.5 h-3.5 ${
                            selectedTag === 'favorites' ? 'fill-white text-white' : 'fill-rose-500 text-rose-500'
                          }`}
                        />
                        <span>Favourites</span>
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                            selectedTag === 'favorites' ? 'bg-rose-900/60 text-white' : 'bg-rose-200/80 text-rose-900'
                          }`}
                        >
                          {favoritesCount}
                        </span>
                      </button>

                      {/* 🛒 In Auto-Shopping List Filter */}
                      <button
                        type="button"
                        onClick={() => setSelectedTag(selectedTag === 'in-list' ? 'all' : 'in-list')}
                        className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                          selectedTag === 'in-list'
                            ? 'bg-emerald-700 text-white shadow-2xs'
                            : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/80'
                        }`}
                        title="Filter by In Shopping List"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>In Grocery List</span>
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                            selectedTag === 'in-list' ? 'bg-emerald-900/60 text-white' : 'bg-emerald-200/80 text-emerald-900'
                          }`}
                        >
                          {recipesInShoppingListCount}
                        </span>
                      </button>

                      {POPULAR_RECIPE_TAGS.filter((tag) => familyKidsMode || tag !== 'Kid-Friendly').map((tag) => {
                        const count = recipes.filter((r) => r.tags.includes(tag)).length;
                        if (count === 0) return null;

                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => setSelectedTag(tag)}
                            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                              selectedTag === tag
                                ? 'bg-stone-900 text-white shadow-2xs'
                                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                            }`}
                          >
                            {tag} ({count})
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Horizontal Recipe Cards Strip (Screen Only) */}
                <div className="no-print mb-6 overflow-x-auto pb-2 scrollbar-thin">
                  <div className="flex items-stretch gap-3 min-w-max">
                    {filteredRecipes.length === 0 ? (
                      <div className="w-full py-6 px-4 bg-stone-50 rounded-xl border border-stone-200 text-center text-xs text-stone-500">
                        {selectedTag === 'favorites' ? (
                          <div className="flex flex-col items-center gap-1.5">
                            <Heart className="w-5 h-5 text-rose-300" />
                            <span>No favourite recipes saved yet. Tap the heart icon on any recipe to add it here!</span>
                          </div>
                        ) : selectedTag === 'in-list' ? (
                          <div className="flex flex-col items-center gap-1.5">
                            <ShoppingCart className="w-5 h-5 text-emerald-300" />
                            <span>No recipes added to the auto-shopping list yet. Tap "🛒 Add to List" on any recipe.</span>
                          </div>
                        ) : (
                          <span>No recipes match the active search or category filters.</span>
                        )}
                      </div>
                    ) : (
                      filteredRecipes.map((r) => {
                        const isSelected = activeRecipe?.id === r.id;
                        const servings = servingsMap[r.id] || r.baseServings || 4;

                        return (
                          <div
                            key={r.id}
                            onClick={() => setSelectedRecipeId(r.id)}
                            className={`w-72 p-3.5 rounded-xl border transition-all cursor-pointer text-left flex flex-col justify-between relative group ${
                              isSelected
                                ? 'bg-rose-50/80 border-rose-400 ring-2 ring-rose-300/40 shadow-xs'
                                : 'bg-white border-stone-200 hover:border-stone-300 hover:bg-stone-50/60'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between gap-1 mb-1.5">
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white border border-stone-200 text-stone-700">
                                  {r.mealType || 'Dinner'}
                                </span>

                                <div className="flex items-center gap-1">
                                  <span className="text-[11px] font-mono text-stone-600 flex items-center gap-1 mr-1">
                                    <Clock className="w-3 h-3 text-stone-400" />
                                    <span>{r.cookTime || r.prepTime}</span>
                                  </span>

                                  {/* Interactive Favourite Toggle */}
                                  <button
                                    type="button"
                                    onClick={(e) => handleToggleFavorite(r, e)}
                                    className={`p-1 rounded-full transition-all cursor-pointer hover:scale-110 ${
                                      r.isFavorite
                                        ? 'bg-rose-100/90 text-rose-600 hover:bg-rose-200'
                                        : 'text-stone-300 hover:text-rose-500 hover:bg-stone-100'
                                    }`}
                                    title={r.isFavorite ? 'Remove from Favourites' : 'Mark as Favourite'}
                                  >
                                    <Heart
                                      className={`w-3.5 h-3.5 ${
                                        r.isFavorite ? 'fill-rose-500 text-rose-500' : 'text-stone-300'
                                      }`}
                                    />
                                  </button>
                                </div>
                              </div>

                              <h3 className="text-xs font-bold text-stone-900 line-clamp-2 leading-snug">
                                {r.title}
                              </h3>
                            </div>

                            <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px]">
                              <span className="font-bold text-rose-800">
                                {servings} servings
                              </span>

                              {/* Quick Auto-Shopping List Toggle Button on Card */}
                              <button
                                type="button"
                                onClick={(e) => handleToggleRecipeShoppingList(r, e)}
                                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer inline-flex items-center gap-1 ${
                                  r.isInShoppingList
                                    ? 'bg-emerald-600 text-white shadow-2xs'
                                    : 'bg-stone-100 text-stone-600 hover:bg-emerald-50 hover:text-emerald-800'
                                }`}
                                title={r.isInShoppingList ? 'Remove from Auto-Shopping List' : 'Add to Auto-Shopping List'}
                              >
                                <ShoppingCart className="w-3 h-3" />
                                <span>{r.isInShoppingList ? 'In List ✓' : '+ List'}</span>
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* 2-Column Physical Planner Layout (Formatted for Standard Paper / @media print) */}
                {activeRecipe ? (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start print-grid-2col">
                    {/* Left Column (lg: 7 cols): Formatted Recipe Card with Portion Scaler */}
                    <div className="lg:col-span-7 bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 shadow-2xs card-print">
                      {/* Recipe Header */}
                      <div className="border-b border-stone-200 pb-4 mb-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
                                {activeRecipe.mealType || 'Dinner'}
                              </span>

                              {/* Family Favourite Badge */}
                              {activeRecipe.isFavorite && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                                  <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
                                  <span>{familyKidsMode ? 'Family Favourite' : 'Favourite Recipe'}</span>
                                </span>
                              )}

                              {/* Auto-Shopping List Badge */}
                              {activeRecipe.isInShoppingList && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                                  <ShoppingCart className="w-3 h-3 text-emerald-600" />
                                  <span>In Auto-Shopping List</span>
                                </span>
                              )}

                              {activeRecipe.tags
                                .filter((t) => familyKidsMode || t !== 'Kid-Friendly')
                                .map((t) => (
                                  <span
                                    key={t}
                                    className="text-[10px] font-semibold px-2 py-0.5 rounded bg-stone-100 text-stone-700"
                                  >
                                    {t}
                                  </span>
                                ))}
                            </div>

                            <h2 className="text-lg sm:text-xl font-serif-heading font-black text-stone-900 leading-snug flex items-center gap-2">
                              <span>{activeRecipe.title}</span>
                              {activeRecipe.isFavorite && (
                                <Heart className="w-4 h-4 fill-rose-500 text-rose-500 shrink-0 inline no-print" />
                              )}
                            </h2>

                            {activeRecipe.sourceUrl && (
                              <a
                                href={activeRecipe.sourceUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 hover:underline mt-1"
                              >
                                <span>Original Recipe Link</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>

                          {/* Favourite / Edit / Delete actions */}
                          <div className="no-print flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleToggleFavorite(activeRecipe)}
                              className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                                activeRecipe.isFavorite
                                  ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100 shadow-2xs'
                                  : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50 hover:text-rose-600'
                              }`}
                              title={activeRecipe.isFavorite ? 'Remove from Favourites' : 'Mark as Favourite'}
                            >
                              <Heart
                                className={`w-3.5 h-3.5 ${
                                  activeRecipe.isFavorite ? 'fill-rose-500 text-rose-500' : 'text-stone-400'
                                }`}
                              />
                              <span className="hidden sm:inline">
                                {activeRecipe.isFavorite ? 'Favourited' : 'Favourite'}
                              </span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(activeRecipe)}
                              className="p-1.5 text-stone-500 hover:text-stone-800 rounded-lg hover:bg-stone-100 cursor-pointer"
                              title="Edit Recipe"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteRecipe(activeRecipe.id)}
                              className="p-1.5 text-stone-500 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer"
                              title="Delete Recipe"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Prep & Cook Times */}
                        <div className="flex items-center gap-4 mt-3 text-xs text-stone-600 font-mono">
                          {activeRecipe.prepTime && (
                            <div className="flex items-center gap-1.5">
                              <span className="text-stone-600 font-sans">Prep:</span>
                              <span className="font-bold text-stone-800">{activeRecipe.prepTime}</span>
                            </div>
                          )}
                          {activeRecipe.cookTime && (
                            <div className="flex items-center gap-1.5">
                              <span className="text-stone-600 font-sans">Cook:</span>
                              <span className="font-bold text-stone-800">{activeRecipe.cookTime}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1.5">
                            <span className="text-stone-600 font-sans">Base:</span>
                            <span className="font-bold text-stone-800">{activeRecipe.baseServings} portions</span>
                          </div>
                        </div>
                      </div>

                      {/* Dynamic Family Size / Portion Scaler Stepper */}
                      <div className="mb-5 p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-1.5 text-xs font-black text-amber-950 uppercase tracking-wider">
                            <Users className="w-4 h-4 text-amber-700" />
                            <span>{familyKidsMode ? 'Dynamic Family Portion Scaler' : 'Dynamic Portion Scaler'}</span>
                          </div>
                          <p className="text-[11px] text-amber-800 mt-0.5">
                            Ingredients and shopping quantities auto-recalculate for this exact portion count
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="inline-flex items-center bg-white border border-amber-300 rounded-xl p-1 shadow-2xs">
                            <button
                              type="button"
                              onClick={() => handleUpdateServings(activeRecipe.id, -1)}
                              disabled={activeServings <= 1}
                              className="p-1 rounded-lg hover:bg-amber-100 disabled:opacity-30 cursor-pointer text-amber-900"
                              title="Decrease servings"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>

                            <span className="px-3 text-xs font-black font-mono text-amber-950">
                              {activeServings} Servings
                            </span>

                            <button
                              type="button"
                              onClick={() => handleUpdateServings(activeRecipe.id, 1)}
                              className="p-1 rounded-lg hover:bg-amber-100 cursor-pointer text-amber-900"
                              title="Increase servings"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Quick Presets (Screen only) */}
                          <div className="no-print hidden sm:flex items-center gap-1">
                            {[2, 4, 6, 8].map((s) => (
                              <button
                                key={s}
                                type="button"
                                onClick={() => handleSetExactServings(activeRecipe.id, s)}
                                className={`px-2 py-1 text-[10px] font-bold rounded-lg border transition-colors cursor-pointer ${
                                  activeServings === s
                                    ? 'bg-amber-800 text-white border-amber-800'
                                    : 'bg-white text-amber-900 border-amber-200 hover:bg-amber-100'
                                }`}
                              >
                                {s}p
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Scaled Ingredients Checklist */}
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-2.5">
                          <h3 className="text-xs sm:text-sm font-black text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                            <span>Scaled Ingredients</span>
                            <span className="text-stone-600 font-normal">
                              ({activeRecipe.ingredients.length} items for {activeServings} servings)
                            </span>
                          </h3>

                          {/* Dynamic Auto-Shopping List Button */}
                          <button
                            type="button"
                            onClick={() => handleToggleRecipeShoppingList(activeRecipe)}
                            className={`no-print inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-2xs ${
                              activeRecipe.isInShoppingList
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                : 'bg-rose-100 hover:bg-rose-200 text-rose-950 border border-rose-300'
                            }`}
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            <span>
                              {activeRecipe.isInShoppingList
                                ? `In Grocery List (${activeServings}p) ✓`
                                : `🛒 Add to Auto-Shopping List`}
                            </span>
                          </button>
                        </div>

                        <div className="divide-y divide-stone-100 border border-stone-200 rounded-xl overflow-hidden bg-stone-50/50">
                          {activeRecipe.ingredients.map((ing) => {
                            const scaledQty = formatScaledAmount(
                              ing.baseAmount,
                              activeRecipe.baseServings,
                              activeServings
                            );

                            return (
                              <div
                                key={ing.id}
                                className="p-2.5 sm:px-3.5 flex items-center justify-between text-xs hover:bg-white transition-colors"
                              >
                                <div className="flex items-center gap-2.5">
                                  <span className="w-3.5 h-3.5 rounded border border-stone-300 bg-white inline-block shrink-0" />
                                  <span className="font-semibold text-stone-900">
                                    {ing.name}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2 font-mono">
                                  <span className="font-bold text-rose-900 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                                    {scaledQty} {ing.unit}
                                  </span>
                                  <span className="text-[10px] text-stone-600 font-sans hidden sm:inline">
                                    ({ing.department || categorizeIngredient(ing.name)})
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Step-by-Step Cooking Instructions */}
                      <div className="mb-4">
                        <h3 className="text-xs sm:text-sm font-black text-stone-900 uppercase tracking-wider mb-2.5">
                          Cooking Instructions
                        </h3>

                        <div className="space-y-2.5">
                          {activeRecipe.instructions.map((step, idx) => (
                            <div
                              key={`step-${idx}`}
                              className="flex items-start gap-3 text-xs leading-relaxed p-2.5 rounded-xl bg-stone-50/60 border border-stone-100"
                            >
                              <span className="w-5 h-5 rounded-full bg-stone-800 text-white flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                                {idx + 1}
                              </span>
                              <p className="text-stone-800 font-medium pt-0.5">{step}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Recipe Notes */}
                      {activeRecipe.notes && (
                        <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-600">
                          <span className="font-bold text-stone-800">
                            {familyKidsMode ? 'Mom’s Meal Prep Tip: ' : 'Prep & Storage Tip: '}
                          </span>
                          <span>
                            {familyKidsMode
                              ? activeRecipe.notes
                              : activeRecipe.notes
                                  .replace(/Kids love the crispy broccoli florets\./gi, 'Delicious with garlic butter rice or warm pita bread.')
                                  .replace(/Kids love.*?\./gi, 'Delicious with garlic butter rice or warm pita bread.')
                                  .replace(/school morning breakfasts/gi, 'quick grab-and-go breakfasts')}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Right Column (lg: 5 cols): Weekly Categorized Grocery Checklist */}
                    <div className="lg:col-span-5 bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 shadow-2xs card-print">
                      <div className="border-b border-stone-200 pb-3 mb-4 flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <ShoppingCart className="w-4 h-4 text-emerald-700" />
                            <h2 className="text-sm sm:text-base font-black text-stone-900 uppercase tracking-wider">
                              Auto-Shopping List
                            </h2>
                          </div>
                          <p className="text-[11px] text-stone-600 mt-0.5">
                            Auto-categorized by store department
                          </p>
                        </div>

                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {checkedShoppingItems}/{totalShoppingItems} Checked
                        </span>
                      </div>

                      {/* Add Custom Item Input (Screen only) */}
                      <form onSubmit={handleAddCustomShoppingItem} className="no-print mb-4 space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={customShoppingText}
                            onChange={(e) => setCustomShoppingText(e.target.value)}
                            placeholder="Add item (e.g. Greek Yogurt, Eggs)..."
                            className="flex-1 px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                          />
                          <select
                            value={customShoppingDept}
                            onChange={(e) => setCustomShoppingDept(e.target.value as GroceryDepartment)}
                            className="px-2 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-700 focus:outline-none"
                          >
                            {GROCERY_DEPARTMENTS.map((d) => (
                              <option key={d} value={d}>
                                {d}
                              </option>
                            ))}
                          </select>
                          <button
                            type="submit"
                            className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Batch Actions */}
                        <div className="flex items-center justify-between text-[11px] pt-1">
                          <button
                            type="button"
                            onClick={onClearCheckedShoppingItems}
                            className="text-stone-600 hover:text-stone-800 underline cursor-pointer"
                          >
                            Clear checked items
                          </button>
                          <button
                            type="button"
                            onClick={onClearAllShoppingItems}
                            className="text-stone-600 hover:text-rose-600 underline cursor-pointer"
                          >
                            Clear entire list
                          </button>
                        </div>
                      </form>

                      {/* Categorized Grocery List */}
                      {totalShoppingItems === 0 ? (
                        <div className="text-center py-10 border border-dashed border-stone-200 rounded-xl bg-stone-50/50">
                          <ShoppingCart className="w-7 h-7 text-stone-300 mx-auto mb-1.5" />
                          <p className="text-xs font-bold text-stone-600">Grocery List Empty</p>
                          <p className="text-[11px] text-stone-400 mt-0.5">
                            Click "🛒 Add to Auto-Shopping List" on any recipe above.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {GROCERY_DEPARTMENTS.map((dept) => {
                            const items = groupedShoppingList[dept] || [];
                            if (items.length === 0) return null;
                            const config = DEPARTMENT_CONFIG[dept];

                            return (
                              <div key={dept} className="print-break-inside-avoid">
                                <div className="flex items-center justify-between pb-1 border-b border-stone-200 mb-1.5">
                                  <span className="text-[11px] font-black text-stone-800 uppercase tracking-wider flex items-center gap-1">
                                    <span>{config.icon}</span>
                                    <span>{config.label}</span>
                                  </span>
                                  <span className="text-[10px] font-mono text-stone-600">
                                    {items.length} items
                                  </span>
                                </div>

                                <div className="space-y-1">
                                  {items.map((item) => (
                                    <div
                                      key={item.id}
                                      onClick={() => onToggleShoppingItem(item.id)}
                                      className={`p-2 rounded-lg border transition-all cursor-pointer flex items-center justify-between text-xs ${
                                        item.checked
                                          ? 'bg-stone-50/60 border-stone-200 text-stone-600 line-through'
                                          : 'bg-white border-stone-200/90 text-stone-800 hover:border-stone-300'
                                      }`}
                                    >
                                      <div className="flex items-center gap-2">
                                        {item.checked ? (
                                          <CheckSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                        ) : (
                                          <Square className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                                        )}
                                        <span className="font-semibold">{item.name}</span>
                                      </div>

                                      <div className="flex items-center gap-1.5">
                                        {item.amount && (
                                          <span className="font-mono text-[11px] text-stone-600 font-bold">
                                            {item.amount}
                                          </span>
                                        )}
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            onDeleteShoppingItem(item.id);
                                          }}
                                          className="no-print p-0.5 text-stone-300 hover:text-rose-600 rounded cursor-pointer"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Printable Footer notes */}
                      <div className="mt-6 pt-3 border-t border-stone-200 text-[10px] font-mono text-stone-400 flex items-center justify-between">
                        <span>Mompreneur Life OS • Grocery Refill Page</span>
                        <span>Aisle Checked</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <UtensilsCrossed className="w-10 h-10 text-stone-300 mx-auto mb-2" />
                    <p className="text-sm font-bold text-stone-700">No Recipe Selected</p>
                    <button
                      type="button"
                      onClick={handleOpenAddModal}
                      className="mt-3 px-4 py-2 bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs"
                    >
                      Create Your First Recipe
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal: Save / Import Online Recipe */}
      <Modal
        isOpen={isAddRecipeModalOpen}
        onClose={() => setIsAddRecipeModalOpen(false)}
        title={editingRecipe ? 'Edit Saved Recipe' : 'Add Recipe to Vault & Meal Prep'}
      >
        <div className="space-y-4">
          {/* Sub-Mode Tabs */}
          {!editingRecipe && (
            <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-xl border border-stone-200">
              <button
                type="button"
                onClick={() => setModalImportMode('url')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  modalImportMode === 'url'
                    ? 'bg-white text-rose-800 shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                <span>Auto-Import from URL</span>
              </button>

              <button
                type="button"
                onClick={() => setModalImportMode('paste')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  modalImportMode === 'paste'
                    ? 'bg-white text-rose-800 shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-rose-600" />
                <span>Paste Raw Text</span>
              </button>

              <button
                type="button"
                onClick={() => setModalImportMode('manual')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  modalImportMode === 'manual'
                    ? 'bg-white text-stone-900 shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5 text-stone-500" />
                <span>Manual Form</span>
              </button>
            </div>
          )}

          {/* Tab 1: ✨ Auto-Import from URL */}
          {!editingRecipe && modalImportMode === 'url' && (
            <div className="p-4 bg-rose-50/60 rounded-2xl border border-rose-200/80 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-rose-700" />
                <h3 className="text-xs font-bold text-rose-950 uppercase tracking-wider">
                  Auto-Import Recipe from Any Cooking Website
                </h3>
              </div>
              <p className="text-[11px] text-rose-900/80">
                Paste any food blog or cooking website link to automatically extract Title, Servings, Cook Time, Ingredients, and Steps.
              </p>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <LinkIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://cooking.nytimes.com/... or https://budgetbytes.com/..."
                    className="w-full pl-9 pr-3 py-2 bg-white border border-rose-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleAutoImportUrl()}
                  disabled={isUrlImporting || !urlInput.trim()}
                  className="px-4 py-2 bg-rose-700 hover:bg-rose-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-xs shrink-0"
                >
                  {isUrlImporting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Parsing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Fetch & Fill Form</span>
                    </>
                  )}
                </button>
              </div>

              {urlImportStatus && (
                <div className="p-2.5 bg-white/90 rounded-xl border border-rose-200 text-xs font-semibold text-rose-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{urlImportStatus}</span>
                </div>
              )}

              {/* Quick sample links for instant test */}
              <div className="pt-2 border-t border-rose-200/60">
                <span className="text-[10px] font-bold text-rose-900 uppercase tracking-wider block mb-1.5">
                  Try 1-Click Demo Recipe Links:
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    { label: '🍝 Tuscan Chicken Pasta', url: 'https://nourishingmoms.com/20-min-tuscan-garlic-chicken-pasta' },
                    { label: '🌮 Sheet-Pan Lime Fajitas', url: 'https://familyfoodmom.com/one-pan-lime-steak-fajitas' },
                    { label: '🥣 Instant Pot Turkey Chili', url: 'https://healthymomprep.com/instant-pot-turkey-sweet-potato-chili' },
                    { label: '🥞 Greek Yogurt Pancakes', url: 'https://quickbreakfasts.com/fluffy-greek-yogurt-protein-pancakes' },
                  ].map((sample) => (
                    <button
                      key={sample.label}
                      type="button"
                      onClick={() => {
                        setUrlInput(sample.url);
                        handleAutoImportUrl(sample.url);
                      }}
                      className="px-2 py-1 bg-white hover:bg-rose-100/80 border border-rose-200 rounded-lg text-[10px] font-semibold text-rose-900 cursor-pointer transition-colors"
                    >
                      {sample.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: 📋 Paste Raw Text */}
          {!editingRecipe && modalImportMode === 'paste' && (
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-stone-700" />
                <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                  Paste Entire Recipe Text (Instagram / Pinterest / Notes)
                </h3>
              </div>
              <p className="text-[11px] text-stone-600">
                Paste any unstructured recipe snippet. The smart parser extracts servings, ingredients, departments, and step numbers automatically.
              </p>

              <textarea
                rows={6}
                value={rawTextInput}
                onChange={(e) => setRawTextInput(e.target.value)}
                placeholder="Paste recipe here, e.g.:&#10;Creamy Garlic Tuscan Salmon&#10;Serves 4 | Prep 15 min | Cook 20 min&#10;Ingredients:&#10;4 salmon fillets [Meat & Seafood]&#10;2 cups baby spinach [Produce]&#10;1 cup heavy cream [Dairy & Refrigerated]&#10;3 cloves garlic minced&#10;1 tbsp olive oil&#10;Instructions:&#10;1. Season salmon with salt and pepper.&#10;2. Sear in olive oil over medium heat.&#10;3. Simmer cream, garlic, and spinach."
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-mono text-stone-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />

              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={handleParseRawText}
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                  <span>Parse into Recipe Fields</span>
                </button>
              </div>
            </div>
          )}

          {/* Main Recipe Form */}
          <form onSubmit={handleSaveRecipe} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Recipe Title *
              </label>
              <input
                type="text"
                required
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g., Sheet-Pan Lemon Herb Chicken & Roasted Veggies"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Recipe Source URL (Optional)
                </label>
                <input
                  type="url"
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Meal Category
                </label>
                <select
                  value={formMealType}
                  onChange={(e) => setFormMealType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                >
                  <option value="dinner">🍲 Weeknight Dinner</option>
                  <option value="breakfast">🥞 Quick Breakfast</option>
                  <option value="lunch">🥪 School / Work Lunch</option>
                  <option value="snack">🍎 After-School Snack</option>
                  <option value="baking">🧁 Baking & Treats</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Prep Time
                </label>
                <input
                  type="text"
                  value={formPrepTime}
                  onChange={(e) => setFormPrepTime(e.target.value)}
                  placeholder="15 mins"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Cook Time
                </label>
                <input
                  type="text"
                  value={formCookTime}
                  onChange={(e) => setFormCookTime(e.target.value)}
                  placeholder="25 mins"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Base Servings
                </label>
                <input
                  type="number"
                  min="1"
                  max="24"
                  value={formServings}
                  onChange={(e) => setFormServings(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none font-bold"
                />
              </div>
            </div>

            {/* Ingredients Paste Area */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-stone-700">
                  Ingredients List (One per line with optional [Department]) *
                </label>
                <span className="text-[10px] text-stone-600">
                  e.g. 1.5 lbs chicken breasts [Meat & Seafood]
                </span>
              </div>
              <textarea
                rows={4}
                required
                value={formIngredientsRaw}
                onChange={(e) => setFormIngredientsRaw(e.target.value)}
                placeholder="1.5 lbs chicken breasts [Meat & Seafood]&#10;2 cups fresh broccoli [Produce]&#10;3 tbsp olive oil [Pantry & Dry Goods]&#10;1/2 cup parmesan cheese [Dairy & Refrigerated]"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono text-stone-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>

            {/* Instructions Paste Area */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Step-by-Step Instructions (One per line) *
              </label>
              <textarea
                rows={4}
                required
                value={formInstructionsRaw}
                onChange={(e) => setFormInstructionsRaw(e.target.value)}
                placeholder="1. Preheat oven to 400°F (200°C).&#10;2. Toss chicken & broccoli with olive oil and spices.&#10;3. Roast for 25 minutes until golden crisp."
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Mom’s Meal Prep / Freezing Notes
              </label>
              <input
                type="text"
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                placeholder="e.g., Kids love with rice. Great for freezing in Souper Cubes."
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none"
              />
            </div>

            {/* Toggles: Family Favourite & Add to Auto-Shopping List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-200/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className={`w-4 h-4 ${formIsFavorite ? 'fill-rose-500 text-rose-500' : 'text-stone-400'}`} />
                  <div>
                    <label htmlFor="formIsFavorite" className="text-xs font-bold text-stone-900 cursor-pointer">
                      Family Favourite
                    </label>
                    <p className="text-[10px] text-stone-500">Highlighted with heart</p>
                  </div>
                </div>

                <input
                  id="formIsFavorite"
                  type="checkbox"
                  checked={formIsFavorite}
                  onChange={(e) => setFormIsFavorite(e.target.checked)}
                  className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500 border-stone-300 cursor-pointer"
                />
              </div>

              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingCart className={`w-4 h-4 ${formIsInShoppingList ? 'text-emerald-700' : 'text-stone-400'}`} />
                  <div>
                    <label htmlFor="formIsInShoppingList" className="text-xs font-bold text-stone-900 cursor-pointer">
                      Auto-Grocery List
                    </label>
                    <p className="text-[10px] text-stone-500">Auto-add ingredients</p>
                  </div>
                </div>

                <input
                  id="formIsInShoppingList"
                  type="checkbox"
                  checked={formIsInShoppingList}
                  onChange={(e) => setFormIsInShoppingList(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 border-stone-300 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setIsAddRecipeModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                {editingRecipe ? 'Save Recipe' : 'Add to Vault'}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};
