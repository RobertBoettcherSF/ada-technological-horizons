with Interfaces;

package Ath_Hear_Exports is
   function Ath_Hear_Power (Distance : Long_Float) return Long_Float
   with Export, Convention => C, External_Name => "ath_hear_power";

   function Ath_Hear_Intensity (Distance : Long_Float) return Long_Float
   with Export, Convention => C, External_Name => "ath_hear_intensity";

   function Ath_Hear_Gain (Distance : Long_Float) return Long_Float
   with Export, Convention => C, External_Name => "ath_hear_gain";

   function Ath_Hear_Distance_Of (Slider : Long_Float) return Long_Float
   with Export, Convention => C, External_Name => "ath_hear_distance_of";

   function Ath_Hear_Slider_Of (Distance : Long_Float) return Long_Float
   with Export, Convention => C, External_Name => "ath_hear_slider_of";

   function Ath_Hear_Reference return Long_Float
   with Export, Convention => C, External_Name => "ath_hear_reference";

   function Ath_Hear_Far return Long_Float
   with Export, Convention => C, External_Name => "ath_hear_far";

   function Ath_Hear_Min return Long_Float
   with Export, Convention => C, External_Name => "ath_hear_min";

   function Ath_Hear_Max return Long_Float
   with Export, Convention => C, External_Name => "ath_hear_max";

   function Ath_Hear_Letter_Years return Long_Float
   with Export, Convention => C, External_Name => "ath_hear_letter_years";

   function Ath_Hear_Letter_Round return Long_Float
   with Export, Convention => C, External_Name => "ath_hear_letter_round";

   function Ath_Hear_Generations return Long_Float
   with Export, Convention => C, External_Name => "ath_hear_generations";

   function Ath_Hear_Generation_Years return Long_Float
   with Export, Convention => C, External_Name => "ath_hear_generation_years";

   function Ath_Hear_Dish_Lem return Long_Float
   with Export, Convention => C, External_Name => "ath_hear_dish_lem";

   function Ath_Hear_Ozma_Feet return Long_Float
   with Export, Convention => C, External_Name => "ath_hear_ozma_feet";

   function Ath_Hear_Ozma_Metres return Long_Float
   with Export, Convention => C, External_Name => "ath_hear_ozma_metres";

   function Ath_Hear_Sample_Count return Interfaces.Integer_32
   with Export, Convention => C, External_Name => "ath_hear_sample_count";

   function Ath_Hear_Sample_Distance
     (Index : Interfaces.Integer_32) return Long_Float
   with Export, Convention => C, External_Name => "ath_hear_sample_distance";

   function Ath_Hear_Sample_Power
     (Index : Interfaces.Integer_32) return Long_Float
   with Export, Convention => C, External_Name => "ath_hear_sample_power";

   function Ath_Hear_Sample_X
     (Index : Interfaces.Integer_32) return Long_Float
   with Export, Convention => C, External_Name => "ath_hear_sample_x";
end Ath_Hear_Exports;
