with Ada.Numerics.Long_Elementary_Functions;
with Ada.Unchecked_Conversion;

package body Ath_Energy is
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

   function Clamp_Years (Years : Long_Float) return Long_Float is
   begin
      if not Is_Finite (Years) or else Years <= 0.0 then
         return 0.0;
      elsif Years >= Horizon_Years then
         return Horizon_Years;
      else
         return Years;
      end if;
   end Clamp_Years;

   function Compound (Rate, Years : Long_Float) return Long_Float is
   begin
      if Years = 0.0 then
         return 1.0;
      end if;
      return Exp (Years * Log (1.0 + Rate));
   end Compound;

   function Stated_Rate return Long_Float is
   begin
      return Exp (Log (Stated_Times) / Horizon_Years) - 1.0;
   end Stated_Rate;

   function Third_Factor (Years : Long_Float) return Long_Float is
   begin
      return Compound (Third_Rate, Clamp_Years (Years));
   end Third_Factor;

   function Stated_Factor (Years : Long_Float) return Long_Float is
   begin
      return Compound (Stated_Rate, Clamp_Years (Years));
   end Stated_Factor;

   function Today_Erg return Long_Float is
   begin
      return Sun_Erg * Sun_Share_At_End / Stated_Times;
   end Today_Erg;

   function Energy_Stated (Years : Long_Float) return Long_Float is
   begin
      return Today_Erg * Stated_Factor (Years);
   end Energy_Stated;

   function Energy_Third (Years : Long_Float) return Long_Float is
   begin
      return Today_Erg * Third_Factor (Years);
   end Energy_Third;

   function Sun_Share (Years : Long_Float) return Long_Float is
   begin
      return Energy_Stated (Years) / Sun_Erg;
   end Sun_Share;

   function Modern_Sun_Erg return Long_Float is
   begin
      return Modern_Sun_Watt * Erg_Per_Watt;
   end Modern_Sun_Erg;

   function Sample_Years (Index : Positive) return Long_Float is
   begin
      if Index > Sample_Count then
         return Horizon_Years;
      end if;
      return Horizon_Years * Long_Float (Index - 1) / Long_Float (Sample_Count - 1);
   end Sample_Years;
end Ath_Energy;
