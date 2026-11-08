with Interfaces;

--  Fixed-width growth export. Samples use indexes 1 .. Sample_Count.
--  Sample times are calendar years. A non-zero growth status clears the
--  quantity, the factor, the end year and every sample. The target call is
--  separate: an invalid target does not erase a valid curve.
package Ath_Growth_Exports is
   function Ath_Growth_F64
     (Initial, Doubling, Elapsed, Start_Year : Long_Float)
      return Interfaces.Integer_32
   with Export, Convention => C, External_Name => "ath_growth_f64";

   function Ath_Growth_Quantity return Long_Float
   with Export, Convention => C, External_Name => "ath_growth_quantity";

   function Ath_Growth_Factor return Long_Float
   with Export, Convention => C, External_Name => "ath_growth_factor";

   function Ath_Growth_End_Year return Long_Float
   with Export, Convention => C, External_Name => "ath_growth_end_year";

   function Ath_Growth_Baseline_Status return Interfaces.Integer_32
   with Export, Convention => C, External_Name => "ath_growth_baseline_status";

   function Ath_Growth_Sample_Count return Interfaces.Integer_32
   with Export, Convention => C, External_Name => "ath_growth_sample_count";

   function Ath_Growth_Sample_Time
     (Index : Interfaces.Integer_32) return Long_Float
   with Export, Convention => C, External_Name => "ath_growth_sample_time";

   function Ath_Growth_Sample_Quantity
     (Index : Interfaces.Integer_32) return Long_Float
   with Export, Convention => C, External_Name => "ath_growth_sample_quantity";

   function Ath_Growth_Sample_Baseline
     (Index : Interfaces.Integer_32) return Long_Float
   with Export, Convention => C, External_Name => "ath_growth_sample_baseline";

   function Ath_Growth_Target_F64
     (Initial, Doubling, Elapsed, Start_Year, Target : Long_Float)
      return Interfaces.Integer_32
   with Export, Convention => C, External_Name => "ath_growth_target_f64";

   function Ath_Growth_Target_Elapsed return Long_Float
   with Export, Convention => C, External_Name => "ath_growth_target_elapsed";

   function Ath_Growth_Target_Year return Long_Float
   with Export, Convention => C, External_Name => "ath_growth_target_year";
end Ath_Growth_Exports;
