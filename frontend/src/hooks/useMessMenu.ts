import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export interface MessMenuDay {
  day: string;
  breakfast: string;
  lunch: string;
  dinner: string;
}

export type MessMealField = 'breakfast' | 'lunch' | 'dinner';

export const MESS_DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const DEFAULT_MENU: MessMenuDay[] = [
  { day: 'Monday', breakfast: 'Idli Sambar', lunch: 'Rajma Chawal, Roti, Salad', dinner: 'Dal Makhani, Mix Veg, Roti' },
  { day: 'Tuesday', breakfast: 'Poha, Jalebi', lunch: 'Kadi Pakora, Rice, Roti', dinner: 'Paneer Butter Masala, Roti, Dessert' },
  { day: 'Wednesday', breakfast: 'Aloo Paratha, Curd', lunch: 'Chole Bhature, Rice', dinner: 'Egg Curry / Soyabean, Roti' },
  { day: 'Thursday', breakfast: 'Upma, Chutney', lunch: 'Dal Fry, Jeera Rice, Bhindi', dinner: 'Chicken Curry / Malai Kofta, Roti' },
  { day: 'Friday', breakfast: 'Puri Sabji', lunch: 'Veg Biryani, Raita', dinner: 'Dal Tadka, Aloo Gobi, Roti' },
  { day: 'Saturday', breakfast: 'Masala Dosa, Sambar', lunch: 'Veg Pulao, Raita, Papad', dinner: 'Chole, Rice, Roti' },
  { day: 'Sunday', breakfast: 'Besan Chilla, Chutney', lunch: 'Special Thali (Paneer, Dal, Rice, Roti)', dinner: 'Fried Rice, Manchurian' },
];

// Monday = 0 ... Sunday = 6 (JS getDay() has Sunday = 0)
export const todayMenuIndex = (): number => (new Date().getDay() + 6) % 7;

export function useMessMenu() {
  const queryClient = useQueryClient();

  const menuQuery = useQuery({
    queryKey: ['messMenu'],
    queryFn: () => api.get<MessMenuDay[]>('/mess-menu'),
  });

  const updateDay = useMutation({
    mutationFn: ({ day, field, value }: { day: string; field: MessMealField; value: string }) =>
      api.put<MessMenuDay[]>('/mess-menu', { day, field, value }),
    onSuccess: (next) => {
      queryClient.setQueryData(['messMenu'], next);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Could not update menu');
    },
  });

  return {
    menu: menuQuery.data ?? DEFAULT_MENU,
    isLoading: menuQuery.isLoading,
    updateDay,
  };
}
