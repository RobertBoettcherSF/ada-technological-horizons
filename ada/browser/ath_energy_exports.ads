with Interfaces;

package Ath_Energy_Exports is
   function Ath_Energy_Rate return Long_Float
   with Export, Convention => C, External_Name => "ath_energy_rate";

   function Ath_Energy_Third (Years : Long_Float) return Long_Float
   with Export, Convention => C, External_Name => "ath_energy_third";

   function Ath_Energy_Stated (Years : Long_Float) return Long_Float
   with Export, Convention => C, External_Name => "ath_energy_stated";

   function Ath_Energy_Today return Long_Float
   with Export, Convention => C, External_Name => "ath_energy_today";

   function Ath_Energy_On_Path (Years : Long_Float) return Long_Float
   with Export, Convention => C, External_Name => "ath_energy_on_path";

   function Ath_Energy_On_Third (Years : Long_Float) return Long_Float
   with Export, Convention => C, External_Name => "ath_energy_on_third";

   function Ath_Energy_Sun_Share (Years : Long_Float) return Long_Float
   with Export, Convention => C, External_Name => "ath_energy_sun_share";

   function Ath_Energy_Sun return Long_Float
   with Export, Convention => C, External_Name => "ath_energy_sun";

   function Ath_Energy_Modern_Sun return Long_Float
   with Export, Convention => C, External_Name => "ath_energy_modern_sun";

   function Ath_Energy_Kardashev (Index : Interfaces.Integer_32) return Long_Float
   with Export, Convention => C, External_Name => "ath_energy_kardashev";

   function Ath_Energy_Stars return Long_Float
   with Export, Convention => C, External_Name => "ath_energy_stars";

   function Ath_Energy_Horizon return Long_Float
   with Export, Convention => C, External_Name => "ath_energy_horizon";

   function Ath_Energy_Sample_Count return Interfaces.Integer_32
   with Export, Convention => C, External_Name => "ath_energy_sample_count";

   function Ath_Energy_Sample_Years
     (Index : Interfaces.Integer_32) return Long_Float
   with Export, Convention => C, External_Name => "ath_energy_sample_years";
end Ath_Energy_Exports;
