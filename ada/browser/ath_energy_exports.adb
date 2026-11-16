with Ath_Energy;

package body Ath_Energy_Exports is
   use type Interfaces.Integer_32;

   function Ath_Energy_Rate return Long_Float is
   begin
      return Ath_Energy.Stated_Rate;
   end Ath_Energy_Rate;

   function Ath_Energy_Third (Years : Long_Float) return Long_Float is
   begin
      return Ath_Energy.Third_Factor (Years);
   end Ath_Energy_Third;

   function Ath_Energy_Stated (Years : Long_Float) return Long_Float is
   begin
      return Ath_Energy.Stated_Factor (Years);
   end Ath_Energy_Stated;

   function Ath_Energy_Today return Long_Float is
   begin
      return Ath_Energy.Today_Erg;
   end Ath_Energy_Today;

   function Ath_Energy_On_Path (Years : Long_Float) return Long_Float is
   begin
      return Ath_Energy.Energy_Stated (Years);
   end Ath_Energy_On_Path;

   function Ath_Energy_On_Third (Years : Long_Float) return Long_Float is
   begin
      return Ath_Energy.Energy_Third (Years);
   end Ath_Energy_On_Third;

   function Ath_Energy_Sun_Share (Years : Long_Float) return Long_Float is
   begin
      return Ath_Energy.Sun_Share (Years);
   end Ath_Energy_Sun_Share;

   function Ath_Energy_Sun return Long_Float is
   begin
      return Ath_Energy.Sun_Erg;
   end Ath_Energy_Sun;

   function Ath_Energy_Modern_Sun return Long_Float is
   begin
      return Ath_Energy.Modern_Sun_Erg;
   end Ath_Energy_Modern_Sun;

   function Ath_Energy_Kardashev (Index : Interfaces.Integer_32) return Long_Float is
   begin
      case Index is
         when 1 => return Ath_Energy.Kardashev_I;
         when 2 => return Ath_Energy.Kardashev_II;
         when 3 => return Ath_Energy.Kardashev_III;
         when others => return 0.0;
      end case;
   end Ath_Energy_Kardashev;

   function Ath_Energy_Stars return Long_Float is
   begin
      return Ath_Energy.Visible_Stars;
   end Ath_Energy_Stars;

   function Ath_Energy_Horizon return Long_Float is
   begin
      return Ath_Energy.Horizon_Years;
   end Ath_Energy_Horizon;

   function Ath_Energy_Sample_Count return Interfaces.Integer_32 is
   begin
      return Interfaces.Integer_32 (Ath_Energy.Sample_Count);
   end Ath_Energy_Sample_Count;

   function Ath_Energy_Sample_Years
     (Index : Interfaces.Integer_32) return Long_Float is
   begin
      if Index < 1 then
         return 0.0;
      end if;
      return Ath_Energy.Sample_Years (Positive (Index));
   end Ath_Energy_Sample_Years;
end Ath_Energy_Exports;
