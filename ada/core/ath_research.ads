with Interfaces;

--  Discovery and researcher indices.
--
--  Two aggregate indices, each an unrestricted doubling:
--  D = D0 * 2 ** (t / dD) and R = R0 * 2 ** (t / dR). The ratio is D / R.
--  The book times used here are 30 years for discoveries and 10 for the
--  researcher index. Starting both indices at 1 is a scale, not a census.
--  The ratio is not a forecast that one more researcher produces a discovery.
package Ath_Research is
   pragma Compile_Time_Error
     (Long_Float'Size /= 64,
      "Ath_Research requires a binary64 Long_Float");

   Sample_Count : constant := 61;

   subtype Status_Code is Interfaces.Integer_32;

   Ok                    : constant Status_Code := 0;
   Non_Finite_Input      : constant Status_Code := 1;
   Index_Not_Positive    : constant Status_Code := 2;
   Elapsed_Negative      : constant Status_Code := 3;
   Doubling_Not_Positive : constant Status_Code := 4;
   Result_Not_Finite     : constant Status_Code := 5;

   type Sample_Values is array (1 .. Sample_Count) of Long_Float;

   procedure Compare
     (Discoveries_0, Researchers_0, Discovery_Doubling, Researcher_Doubling, Elapsed : Long_Float;
      Discoveries, Researchers, Ratio : out Long_Float;
      Axis_X_Max, Index_Max, Ratio_Max : out Long_Float;
      Times, Discovery_Samples, Researcher_Samples, Ratio_Samples : out Sample_Values;
      Status : out Status_Code);
end Ath_Research;
