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

   Sample_Count : constant := 11;

   subtype Status_Code is Interfaces.Integer_32;

   Ok                    : constant Status_Code := 0;
   Non_Finite_Input      : constant Status_Code := 1;
   Quantity_Negative     : constant Status_Code := 2;
   Elapsed_Negative      : constant Status_Code := 3;
   Doubling_Not_Positive : constant Status_Code := 4;
   Result_Not_Finite     : constant Status_Code := 5;

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
end Ath_Growth;
