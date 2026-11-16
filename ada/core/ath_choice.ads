with Interfaces;

--  Equally likely independent selections.
--
--  One selection among N possibilities carries log2(N) bits. k independent
--  repetitions have N**k combinations and k*log2(N) bits. A fixed-length
--  binary code may use more bits than that ideal quantity. Neither number
--  is meaning or intelligence.
--
--  k = 0 is one empty combination and 0 bits. N = 1 is 0 bits.
--  N**k may overflow while k*log2(N) stays finite. The count is then not
--  presented as a finite stand-in.
package Ath_Choice is
   pragma Compile_Time_Error
     (Long_Float'Size /= 64,
      "Ath_Choice requires a binary64 Long_Float");

   Sample_Count : constant := 33;

   --  Every integer up to this value is exactly a binary64 number.
   Max_Exact_Integer : constant Long_Float := 2.0 ** 53;

   subtype Status_Code is Interfaces.Integer_32;

   Ok                 : constant Status_Code := 0;
   Non_Finite_Input   : constant Status_Code := 1;
   Not_Integer        : constant Status_Code := 2;
   Count_Not_Positive : constant Status_Code := 3;
   Repeats_Negative   : constant Status_Code := 4;
   Out_Of_Range       : constant Status_Code := 5;
   Result_Not_Finite  : constant Status_Code := 6;

   type Sample_Repeats is array (1 .. Sample_Count) of Long_Float;
   type Sample_Bits is array (1 .. Sample_Count) of Long_Float;

   procedure Choose
     (Possibilities, Repeats : Long_Float;
      Bits_Per, Total_Bits, Code_Per, Code_Total : out Long_Float;
      Combinations, Log10_Count : out Long_Float;
      Combinations_Valid, Combinations_Exact, Code_Total_Valid : out Boolean;
      Axis_X_Max, Axis_Y_Max : out Long_Float;
      Repeats_Out : out Sample_Repeats;
      Totals_Out  : out Sample_Bits;
      Status : out Status_Code);
end Ath_Choice;
