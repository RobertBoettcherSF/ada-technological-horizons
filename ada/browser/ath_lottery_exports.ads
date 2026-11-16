with Interfaces;

package Ath_Lottery_Exports is
   function Ath_Lottery_F64
     (Tickets, Prizes, Bought : Long_Float) return Interfaces.Integer_32
   with Export, Convention => C, External_Name => "ath_lottery_f64";

   function Ath_Lottery_Expected return Long_Float
   with Export, Convention => C, External_Name => "ath_lottery_expected";

   function Ath_Lottery_None return Long_Float
   with Export, Convention => C, External_Name => "ath_lottery_none";

   function Ath_Lottery_None_Representable return Interfaces.Integer_32
   with Export, Convention => C, External_Name => "ath_lottery_none_representable";

   function Ath_Lottery_None_Exact_Zero return Interfaces.Integer_32
   with Export, Convention => C, External_Name => "ath_lottery_none_exact_zero";

   function Ath_Lottery_None_Log10 return Long_Float
   with Export, Convention => C, External_Name => "ath_lottery_none_log10";

   function Ath_Lottery_At_Least return Long_Float
   with Export, Convention => C, External_Name => "ath_lottery_at_least";

   function Ath_Lottery_At_Least_Exact return Interfaces.Integer_32
   with Export, Convention => C, External_Name => "ath_lottery_at_least_exact";

   function Ath_Lottery_Fraction_Valid return Interfaces.Integer_32
   with Export, Convention => C, External_Name => "ath_lottery_fraction_valid";

   function Ath_Lottery_Fraction_Num return Long_Float
   with Export, Convention => C, External_Name => "ath_lottery_fraction_num";

   function Ath_Lottery_Fraction_Den return Long_Float
   with Export, Convention => C, External_Name => "ath_lottery_fraction_den";

   function Ath_Lottery_X_Max return Long_Float
   with Export, Convention => C, External_Name => "ath_lottery_x_max";

   function Ath_Lottery_Expected_Max return Long_Float
   with Export, Convention => C, External_Name => "ath_lottery_expected_max";

   function Ath_Lottery_Sample_Count return Interfaces.Integer_32
   with Export, Convention => C, External_Name => "ath_lottery_sample_count";

   function Ath_Lottery_Sample_Bought
     (Index : Interfaces.Integer_32) return Long_Float
   with Export, Convention => C, External_Name => "ath_lottery_sample_bought";

   function Ath_Lottery_Sample_Expected
     (Index : Interfaces.Integer_32) return Long_Float
   with Export, Convention => C, External_Name => "ath_lottery_sample_expected";

   function Ath_Lottery_Sample_Chance
     (Index : Interfaces.Integer_32) return Long_Float
   with Export, Convention => C, External_Name => "ath_lottery_sample_chance";

   function Ath_Lottery_Sample_Kind
     (Index : Interfaces.Integer_32) return Interfaces.Integer_32
   with Export, Convention => C, External_Name => "ath_lottery_sample_kind";
end Ath_Lottery_Exports;
