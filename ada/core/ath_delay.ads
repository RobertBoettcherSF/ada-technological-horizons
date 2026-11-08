with Interfaces;

--  Light-time for a fixed distance in vacuum.
--
--  One way is distance / c. The reply is the same trip back, so the round
--  trip is twice the one-way time. Nothing is added for processing, relays,
--  motion, or a medium other than vacuum.
--
--  Kilometres use c = 299_792_458 m/s. An astronomical unit is
--  149_597_870_700 m. A light-year is one Julian year of that travel
--  (365.25 days of 86_400 s), so one light-year takes exactly one Julian year.
--
--  Presets are chosen examples held here, not a live ephemeris:
--    1  Earth-Moon average, 384_400 km
--    2  a round average Earth-Mars example, 225_000_000 km
--    3  an illustrative interstellar distance, 1_000 light-years
package Ath_Delay is
   pragma Compile_Time_Error
     (Long_Float'Size /= 64,
      "Ath_Delay requires a binary64 Long_Float");

   subtype Status_Code is Interfaces.Integer_32;

   Ok               : constant Status_Code := 0;
   Non_Finite_Input : constant Status_Code := 1;
   Negative         : constant Status_Code := 2;
   Bad_Unit         : constant Status_Code := 3;
   Result_Not_Finite : constant Status_Code := 4;

   Unit_Kilometres : constant Long_Float := 0.0;
   Unit_Astronomical : constant Long_Float := 1.0;
   Unit_Light_Years : constant Long_Float := 2.0;

   Speed_Of_Light : constant Long_Float := 299_792_458.0;
   Astronomical_Unit_Metres : constant Long_Float := 149_597_870_700.0;
   Julian_Year_Seconds : constant Long_Float := 31_557_600.0;

   Preset_Count : constant := 3;

   subtype Preset_Index is Integer range 1 .. Preset_Count;

   procedure Propagate
     (Distance   : Long_Float;
      Unit       : Long_Float;
      One_Way    : out Long_Float;
      Round_Trip : out Long_Float;
      Status     : out Status_Code);

   function Preset_Distance (Index : Preset_Index) return Long_Float;
   function Preset_Unit (Index : Preset_Index) return Long_Float;
end Ath_Delay;
