with Interfaces;

--  Earthly energy growth and the Kardashev steps.
--
--  Lem writes that energy grows by 1/3 percent a year and that in 2,500 years
--  it is 10^10 times larger, one ten-thousandth of the Sun by the year 4500.
--  He gives the Sun as 4 * 10^33 erg a second, and a shell at the Earth's
--  distance that would catch that output. Kardashev's three steps are
--  4*10^19, 4*10^33 and 4*10^44 erg. Shklovsky's visible universe has 10^21
--  stars. The print says Kardashev's figures are per year; the values here
--  are the powers per second.
--
--  The compound growth is ours. (1 + 1/300)^2500 is about 4,100, not 10^10.
--  The rate that does reach 10^10 in 2,500 years is about 0.925 percent a
--  year. The picture follows that ten-billion-times path. Today's energy is
--  the Sun divided by 10^14, so that 10^10 times today is one ten-thousandth
--  of the Sun. That scale is ours, chosen so Lem's two statements agree.
package Ath_Energy is
   pragma Compile_Time_Error
     (Long_Float'Size /= 64,
      "Ath_Energy requires a binary64 Long_Float");

   Horizon_Years : constant Long_Float := 2_500.0;
   Third_Rate : constant Long_Float := 1.0 / 300.0;
   Stated_Times : constant Long_Float := 1.0e10;
   Sun_Erg : constant Long_Float := 4.0e33;
   Sun_Share_At_End : constant Long_Float := 1.0e-4;
   Kardashev_I : constant Long_Float := 4.0e19;
   Kardashev_II : constant Long_Float := 4.0e33;
   Kardashev_III : constant Long_Float := 4.0e44;
   Visible_Stars : constant Long_Float := 1.0e21;
   Modern_Sun_Watt : constant Long_Float := 3.8e26;
   Erg_Per_Watt : constant Long_Float := 1.0e7;
   Sample_Count : constant := 26;

   function Stated_Rate return Long_Float;
   function Third_Factor (Years : Long_Float) return Long_Float;
   function Stated_Factor (Years : Long_Float) return Long_Float;
   function Today_Erg return Long_Float;
   function Energy_Stated (Years : Long_Float) return Long_Float;
   function Energy_Third (Years : Long_Float) return Long_Float;
   function Sun_Share (Years : Long_Float) return Long_Float;
   function Modern_Sun_Erg return Long_Float;
   function Sample_Years (Index : Positive) return Long_Float;
end Ath_Energy;
