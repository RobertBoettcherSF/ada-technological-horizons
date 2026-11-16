with Ath_Hear;

package body Ath_Hear_Exports is
   use type Interfaces.Integer_32;
   function Ath_Hear_Power (Distance : Long_Float) return Long_Float is
   begin
      return Ath_Hear.Power_Factor (Distance);
   end Ath_Hear_Power;

   function Ath_Hear_Intensity (Distance : Long_Float) return Long_Float is
   begin
      return Ath_Hear.Intensity (Distance);
   end Ath_Hear_Intensity;

   function Ath_Hear_Gain (Distance : Long_Float) return Long_Float is
   begin
      return Ath_Hear.Perceptual_Gain (Distance);
   end Ath_Hear_Gain;

   function Ath_Hear_Distance_Of (Slider : Long_Float) return Long_Float is
   begin
      return Ath_Hear.Distance_Of (Slider);
   end Ath_Hear_Distance_Of;

   function Ath_Hear_Slider_Of (Distance : Long_Float) return Long_Float is
   begin
      return Ath_Hear.Slider_Of (Distance);
   end Ath_Hear_Slider_Of;

   function Ath_Hear_Reference return Long_Float is
   begin
      return Ath_Hear.Reference_Ly;
   end Ath_Hear_Reference;

   function Ath_Hear_Far return Long_Float is
   begin
      return Ath_Hear.Far_Distance;
   end Ath_Hear_Far;

   function Ath_Hear_Min return Long_Float is
   begin
      return Ath_Hear.Distance_Min;
   end Ath_Hear_Min;

   function Ath_Hear_Max return Long_Float is
   begin
      return Ath_Hear.Distance_Max;
   end Ath_Hear_Max;

   function Letter_Field (Which : Positive) return Long_Float is
      One_Way : Long_Float;
      Round_Years : Long_Float;
      Generations : Long_Float;
      Status : Ath_Hear.Status_Code;
   begin
      Ath_Hear.Letter (One_Way, Round_Years, Generations, Status);
      if Status /= Ath_Hear.Ok then
         return 0.0;
      end if;
      if Which = 1 then
         return One_Way;
      elsif Which = 2 then
         return Round_Years;
      else
         return Generations;
      end if;
   end Letter_Field;

   function Ath_Hear_Letter_Years return Long_Float is
   begin
      return Letter_Field (1);
   end Ath_Hear_Letter_Years;

   function Ath_Hear_Letter_Round return Long_Float is
   begin
      return Letter_Field (2);
   end Ath_Hear_Letter_Round;

   function Ath_Hear_Generations return Long_Float is
   begin
      return Letter_Field (3);
   end Ath_Hear_Generations;

   function Ath_Hear_Generation_Years return Long_Float is
   begin
      return Ath_Hear.Generation_Years;
   end Ath_Hear_Generation_Years;

   function Ath_Hear_Dish_Lem return Long_Float is
   begin
      return Ath_Hear.Dish_Lem_Metres;
   end Ath_Hear_Dish_Lem;

   function Ath_Hear_Ozma_Feet return Long_Float is
   begin
      return Ath_Hear.Dish_Ozma_Feet;
   end Ath_Hear_Ozma_Feet;

   function Ath_Hear_Ozma_Metres return Long_Float is
   begin
      return Ath_Hear.Ozma_Metres;
   end Ath_Hear_Ozma_Metres;

   function Ath_Hear_Sample_Count return Interfaces.Integer_32 is
   begin
      return Interfaces.Integer_32 (Ath_Hear.Sample_Count);
   end Ath_Hear_Sample_Count;

   function Ath_Hear_Sample_Distance
     (Index : Interfaces.Integer_32) return Long_Float is
   begin
      if Index < 1 then
         return 0.0;
      end if;
      return Ath_Hear.Sample_Distance (Positive (Index));
   end Ath_Hear_Sample_Distance;

   function Ath_Hear_Sample_Power
     (Index : Interfaces.Integer_32) return Long_Float is
   begin
      if Index < 1 then
         return 0.0;
      end if;
      return Ath_Hear.Sample_Power (Positive (Index));
   end Ath_Hear_Sample_Power;

   function Ath_Hear_Sample_X
     (Index : Interfaces.Integer_32) return Long_Float is
   begin
      if Index < 1 then
         return 0.0;
      end if;
      return Ath_Hear.Sample_X (Positive (Index));
   end Ath_Hear_Sample_X;
end Ath_Hear_Exports;
