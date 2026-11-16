with Ada.Numerics.Long_Elementary_Functions;
with Ada.Unchecked_Conversion;
with Ath_Delay;

package body Ath_Hear is
   use type Ath_Delay.Status_Code;
   use Ada.Numerics.Long_Elementary_Functions;

   type Bits is mod 2 ** 64;

   function To_Bits is
      new Ada.Unchecked_Conversion (Long_Float, Bits);

   function Is_Finite (Value : Long_Float) return Boolean is
      Exponent : constant Bits :=
        (To_Bits (Value) / 2 ** 52) and Bits'(16#7FF#);
   begin
      return Exponent /= 16#7FF#;
   end Is_Finite;

   function Power_Factor (Distance : Long_Float) return Long_Float is
      Ratio : Long_Float;
   begin
      if not Is_Finite (Distance) or else Distance <= 0.0 then
         return 0.0;
      end if;
      Ratio := Distance / Reference_Ly;
      return Ratio * Ratio;
   end Power_Factor;

   function Intensity (Distance : Long_Float) return Long_Float is
      Power : constant Long_Float := Power_Factor (Distance);
   begin
      if Power <= 0.0 then
         return 0.0;
      end if;
      return 1.0 / Power;
   end Intensity;

   function Perceptual_Gain (Distance : Long_Float) return Long_Float is
      Level : constant Long_Float := Intensity (Distance);
      Decibels : Long_Float;
   begin
      if Level <= 0.0 then
         return 0.0;
      end if;
      Decibels := 10.0 * Log (Level) / Log (10.0);
      if Decibels < Gain_Floor_Db then
         Decibels := Gain_Floor_Db;
      elsif Decibels > Gain_Cap_Db then
         Decibels := Gain_Cap_Db;
      end if;
      return Exp (Decibels * Log (10.0) / 20.0);
   end Perceptual_Gain;

   function Distance_Of (Slider : Long_Float) return Long_Float is
      Phase : Long_Float := Slider;
   begin
      if not Is_Finite (Phase) then
         return Distance_Min;
      end if;
      if Phase < 0.0 then
         Phase := 0.0;
      elsif Phase > 1.0 then
         Phase := 1.0;
      end if;
      return Distance_Min * Exp (Phase * Log (Distance_Max / Distance_Min));
   end Distance_Of;

   function Slider_Of (Distance : Long_Float) return Long_Float is
   begin
      if not Is_Finite (Distance) or else Distance <= Distance_Min then
         return 0.0;
      end if;
      if Distance >= Distance_Max then
         return 1.0;
      end if;
      return Log (Distance / Distance_Min) / Log (Distance_Max / Distance_Min);
   end Slider_Of;

   function Far_Distance return Long_Float is
   begin
      return Reference_Ly * Farther_Times;
   end Far_Distance;

   function Ozma_Metres return Long_Float is
   begin
      return Dish_Ozma_Feet * Foot_Metres;
   end Ozma_Metres;

   procedure Letter
     (One_Way_Years : out Long_Float;
      Round_Years   : out Long_Float;
      Generations   : out Long_Float;
      Status        : out Status_Code)
   is
      Seconds : Long_Float;
      Round_Seconds : Long_Float;
      Delay_Status : Ath_Delay.Status_Code;
   begin
      One_Way_Years := 0.0;
      Round_Years := 0.0;
      Generations := 0.0;
      Ath_Delay.Propagate
        (Letter_Ly, Ath_Delay.Unit_Light_Years, Seconds, Round_Seconds, Delay_Status);
      if Delay_Status /= Ath_Delay.Ok then
         Status := Non_Finite;
         return;
      end if;
      One_Way_Years := Seconds / Ath_Delay.Julian_Year_Seconds;
      Round_Years := Round_Seconds / Ath_Delay.Julian_Year_Seconds;
      if not Is_Finite (One_Way_Years) or else not Is_Finite (Round_Years) then
         One_Way_Years := 0.0;
         Round_Years := 0.0;
         Status := Non_Finite;
         return;
      end if;
      Generations := Round_Years / Generation_Years;
      if not Is_Finite (Generations) then
         Generations := 0.0;
         Status := Non_Finite;
         return;
      end if;
      Status := Ok;
   end Letter;

   function Sample_Distance (Index : Positive) return Long_Float is
   begin
      if Index > Sample_Count then
         return Distance_Max;
      end if;
      return Distance_Of (Long_Float (Index - 1) / Long_Float (Sample_Count - 1));
   end Sample_Distance;

   function Sample_Power (Index : Positive) return Long_Float is
   begin
      return Power_Factor (Sample_Distance (Index));
   end Sample_Power;

   function Sample_X (Index : Positive) return Long_Float is
   begin
      return Slider_Of (Sample_Distance (Index));
   end Sample_X;
end Ath_Hear;
