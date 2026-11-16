with Interfaces;

package Ath_Choice_Exports is
   function Ath_Choice_F64
     (Possibilities, Repeats : Long_Float) return Interfaces.Integer_32
   with Export, Convention => C, External_Name => "ath_choice_f64";

   function Ath_Choice_Bits_Per return Long_Float
   with Export, Convention => C, External_Name => "ath_choice_bits_per";

   function Ath_Choice_Total_Bits return Long_Float
   with Export, Convention => C, External_Name => "ath_choice_total_bits";

   function Ath_Choice_Code_Per return Long_Float
   with Export, Convention => C, External_Name => "ath_choice_code_per";

   function Ath_Choice_Code_Total return Long_Float
   with Export, Convention => C, External_Name => "ath_choice_code_total";

   function Ath_Choice_Code_Total_Valid return Interfaces.Integer_32
   with Export, Convention => C, External_Name => "ath_choice_code_total_valid";

   function Ath_Choice_Combinations return Long_Float
   with Export, Convention => C, External_Name => "ath_choice_combinations";

   function Ath_Choice_Combinations_Valid return Interfaces.Integer_32
   with Export, Convention => C, External_Name => "ath_choice_combinations_valid";

   function Ath_Choice_Combinations_Exact return Interfaces.Integer_32
   with Export, Convention => C, External_Name => "ath_choice_combinations_exact";

   function Ath_Choice_Log10_Count return Long_Float
   with Export, Convention => C, External_Name => "ath_choice_log10_count";

   function Ath_Choice_X_Max return Long_Float
   with Export, Convention => C, External_Name => "ath_choice_x_max";

   function Ath_Choice_Y_Max return Long_Float
   with Export, Convention => C, External_Name => "ath_choice_y_max";

   function Ath_Choice_Sample_Count return Interfaces.Integer_32
   with Export, Convention => C, External_Name => "ath_choice_sample_count";

   function Ath_Choice_Sample_Repeat
     (Index : Interfaces.Integer_32) return Long_Float
   with Export, Convention => C, External_Name => "ath_choice_sample_repeat";

   function Ath_Choice_Sample_Bits
     (Index : Interfaces.Integer_32) return Long_Float
   with Export, Convention => C, External_Name => "ath_choice_sample_bits";
end Ath_Choice_Exports;
