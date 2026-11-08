with Interfaces;

--  Fixed-width growth export. Samples use indexes 1 .. Sample_Count.
--  A non-zero status clears the quantity, the factor and every sample.
package Ath_Growth_Exports is
   function Ath_Growth_F64
     (Initial, Doubling, Elapsed : Long_Float) return Interfaces.Integer_32
   with Export, Convention => C, External_Name => "ath_growth_f64";

   function Ath_Growth_Quantity return Long_Float
   with Export, Convention => C, External_Name => "ath_growth_quantity";

   function Ath_Growth_Factor return Long_Float
   with Export, Convention => C, External_Name => "ath_growth_factor";

   function Ath_Growth_Sample_Count return Interfaces.Integer_32
   with Export, Convention => C, External_Name => "ath_growth_sample_count";

   function Ath_Growth_Sample_Time
     (Index : Interfaces.Integer_32) return Long_Float
   with Export, Convention => C, External_Name => "ath_growth_sample_time";

   function Ath_Growth_Sample_Quantity
     (Index : Interfaces.Integer_32) return Long_Float
   with Export, Convention => C, External_Name => "ath_growth_sample_quantity";
end Ath_Growth_Exports;
