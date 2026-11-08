with Interfaces;

--  Fixed-width export for the four-fate mean. Contributions use indexes 1 .. 4.
--  A non-zero status clears the mean and every contribution.
package Ath_Lifetime_Exports is
   function Ath_Lifetime_F64
     (P1, P2, P3, P4, D1, D2, D3, D4 : Long_Float)
      return Interfaces.Integer_32
   with Export, Convention => C, External_Name => "ath_lifetime_f64";

   function Ath_Lifetime_Mean return Long_Float
   with Export, Convention => C, External_Name => "ath_lifetime_mean";

   function Ath_Lifetime_Contribution
     (Index : Interfaces.Integer_32) return Long_Float
   with Export, Convention => C, External_Name => "ath_lifetime_contribution";
end Ath_Lifetime_Exports;
