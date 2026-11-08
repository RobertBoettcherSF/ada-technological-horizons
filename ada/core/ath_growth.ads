with Interfaces;

--  Scientific-information growth.
--
--  N = N0 * 2 ** (t / d). The growth factor is 2 ** (t / d), including when
--  N0 is zero: the quantity is then 0 and the factor is still that power,
--  not a quotient N / N0. t = 0 yields factor 1 and quantity N0.
--
--  The curve is Sample_Count points from elapsed time 0 through t. The last
--  sample is the reported quantity. An infinite power or product is an error.
--  Nothing is capped to a finite stand-in.
--
--  On any error, Quantity, Factor and every sample are 0.0 and must not be
--  presented.
package Ath_Growth is
   pragma Compile_Time_Error
     (Long_Float'Size /= 64,
      "Ath_Growth requires a binary64 Long_Float");

   Sample_Count : constant := 61;

   --  Historical comparison curve. Not a forecast, and not the visitor's
   --  edited doubling time.
   Baseline_Doubling : constant Long_Float := 15.0;

   --  Whole calendar years accepted as a presentation axis.
   Min_Start_Year : constant Long_Float := -10_000.0;
   Max_Start_Year : constant Long_Float := 10_000.0;

   subtype Status_Code is Interfaces.Integer_32;

   Ok                    : constant Status_Code := 0;
   Non_Finite_Input      : constant Status_Code := 1;
   Quantity_Negative     : constant Status_Code := 2;
   Elapsed_Negative      : constant Status_Code := 3;
   Doubling_Not_Positive : constant Status_Code := 4;
   Result_Not_Finite     : constant Status_Code := 5;
   Year_Not_Integer      : constant Status_Code := 6;
   Year_Out_Of_Range     : constant Status_Code := 7;

   subtype Target_Code is Interfaces.Integer_32;

   Target_Within      : constant Target_Code := 0;
   Target_Already     : constant Target_Code := 1;
   Target_Never       : constant Target_Code := 2;
   Target_Outside     : constant Target_Code := 3;
   Target_Invalid     : constant Target_Code := 4;
   Target_Not_Finite  : constant Target_Code := 5;
   Target_No_Scenario : constant Target_Code := 6;

   type Sample_Times is array (1 .. Sample_Count) of Long_Float;
   type Sample_Quantities is array (1 .. Sample_Count) of Long_Float;

   procedure Grow
     (Initial      : Long_Float;
      Doubling     : Long_Float;
      Elapsed      : Long_Float;
      Quantity     : out Long_Float;
      Factor       : out Long_Float;
      Times        : out Sample_Times;
      Quantities   : out Sample_Quantities;
      Status       : out Status_Code);

   --  Calendar samples for the chosen doubling and for the 15-year baseline.
   --  Sample times run from Start_Year through Start_Year + Elapsed. The last
   --  chosen sample is Quantity. A non-finite baseline is reported separately
   --  and is not replaced with a finite curve.
   procedure Chart
     (Initial          : Long_Float;
      Doubling         : Long_Float;
      Elapsed          : Long_Float;
      Start_Year       : Long_Float;
      Quantity         : out Long_Float;
      Factor           : out Long_Float;
      End_Year         : out Long_Float;
      Times            : out Sample_Times;
      Model            : out Sample_Quantities;
      Baseline         : out Sample_Quantities;
      Growth_Status    : out Status_Code;
      Baseline_Status  : out Status_Code);

   --  Elapsed time t = d * log2(Target / N0), and the calendar year
   --  Start_Year + t. A target already at or below N0 is the starting year,
   --  not a crossing placed in the past. N0 = 0 never reaches a positive
   --  target. A finite crossing beyond Elapsed is outside the chart, not
   --  unreachable. Invalid targets and a failed scenario leave both outputs 0.
   procedure Crossing
     (Initial     : Long_Float;
      Doubling    : Long_Float;
      Elapsed     : Long_Float;
      Start_Year  : Long_Float;
      Target      : Long_Float;
      Cross_Time  : out Long_Float;
      Cross_Year  : out Long_Float;
      Status      : out Target_Code);
end Ath_Growth;
