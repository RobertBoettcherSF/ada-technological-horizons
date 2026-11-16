with Interfaces;

--  Lottery without replacement.
--
--  M tickets, W of them prizes, k tickets bought. Each ticket is bought at
--  most once. The expected number of prizes is k*W/M. That is a long-run
--  average, not the result of one draw. The chance of no prize is
--  C(M-W, k)/C(M, k) when k <= M-W, and exactly zero when buying that many
--  tickets must include a prize. A chance too small for binary64 is reported
--  through its base-10 logarithm and is not replaced by zero.
package Ath_Lottery is
   pragma Compile_Time_Error
     (Long_Float'Size /= 64,
      "Ath_Lottery requires a binary64 Long_Float");

   Sample_Count : constant := 33;

   Max_Exact_Integer : constant Long_Float := 2.0 ** 53;

   subtype Status_Code is Interfaces.Integer_32;

   Ok                   : constant Status_Code := 0;
   Non_Finite_Input     : constant Status_Code := 1;
   Not_Integer          : constant Status_Code := 2;
   Tickets_Not_Positive : constant Status_Code := 3;
   Prizes_Out_Of_Range  : constant Status_Code := 4;
   Bought_Out_Of_Range  : constant Status_Code := 5;
   Out_Of_Range         : constant Status_Code := 6;

   Kind_Drawable   : constant Interfaces.Integer_32 := 0;
   Kind_Exact_Zero : constant Interfaces.Integer_32 := 1;
   Kind_Too_Small  : constant Interfaces.Integer_32 := 2;

   type Sample_Values is array (1 .. Sample_Count) of Long_Float;
   type Sample_Kinds is array (1 .. Sample_Count) of Interfaces.Integer_32;

   procedure Draw
     (Tickets, Prizes, Bought : Long_Float;
      Expected, None_Value, None_Log10, At_Least : out Long_Float;
      None_Representable, None_Exact_Zero, At_Least_Exact, Fraction_Valid : out Boolean;
      Fraction_Num, Fraction_Den : out Long_Float;
      Axis_X_Max, Expected_Max : out Long_Float;
      Sample_Used : out Interfaces.Integer_32;
      Bought_Out, Expected_Out, Chance_Out : out Sample_Values;
      Chance_Kind : out Sample_Kinds;
      Status : out Status_Code);
end Ath_Lottery;
