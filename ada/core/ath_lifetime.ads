with Interfaces;

--  Historical four-fate weighted mean.
--
--  Percentages are on a 0 .. 100 scale. Internally each weight is
--  Percentage / 100. The mean is Sum (weight * duration). Durations are
--  years. Weighted_Mean does not repair a total that is not 100.
--  Rebalance keeps the edited probability unchanged and moves the other
--  three by equal additions or subtractions, stopping at 0 and 100. A
--  leftover needed to reach a total of 100 is added to the lowest-index
--  other value that can accept it inside 0 .. 100.
--
--  Total_Tolerance is an absolute allowance in percentage points. It absorbs
--  binary64 rounding of a total that is meant to be 100, and it still rejects
--  totals such as 90 and 110.
--
--  On any error, Mean and Contributions are 0.0 and must not be presented.
package Ath_Lifetime is
   pragma Compile_Time_Error
     (Long_Float'Size /= 64,
      "Ath_Lifetime requires a binary64 Long_Float");

   Fate_Count : constant := 4;

   Total_Tolerance : constant Long_Float := 1.0E-6;

   subtype Status_Code is Interfaces.Integer_32;

   Ok                       : constant Status_Code := 0;
   Non_Finite_Input         : constant Status_Code := 1;
   Probability_Out_Of_Range : constant Status_Code := 2;
   Duration_Negative        : constant Status_Code := 3;
   Total_Out_Of_Range       : constant Status_Code := 4;
   Result_Not_Finite        : constant Status_Code := 5;

   type Fate_Values is array (1 .. Fate_Count) of Long_Float;

   procedure Weighted_Mean
     (Percentages   : Fate_Values;
      Durations     : Fate_Values;
      Contributions : out Fate_Values;
      Mean          : out Long_Float;
      Status        : out Status_Code);

   --  Edited_Index is 1 .. Fate_Count. Edited_Value must be finite and in
   --  0 .. 100. On error, Adjusted is all zeroes.
   procedure Rebalance
     (Base         : Fate_Values;
      Edited_Index : Integer;
      Edited_Value : Long_Float;
      Adjusted     : out Fate_Values;
      Status       : out Status_Code);
end Ath_Lifetime;
