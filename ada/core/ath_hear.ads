with Interfaces;

--  How a radio dish hears a star, and how long a letter takes.
--
--  Lem's figures, kept as he gives them: an Earth-like transmitter is heard
--  out to about 10 light-years, a signal strong enough is heard 100 times
--  farther, and the antenna is 27 metres. The letter goes to a star 1,000
--  light-years away.
--
--  The inverse-square law is ours. Power grows with the square of distance,
--  so 100 times farther needs 10,000 times the power. Received power falls
--  as the square of distance. The beacon uses a gentler decibel curve, also
--  ours, so a far star stays a quiet ping instead of falling silent.
--
--  The letter's years come from the light-time core: one light-year takes
--  one Julian year. A generation of 25 years is our choice, so the 2,000-year
--  round trip is 80 generations.
package Ath_Hear is
   pragma Compile_Time_Error
     (Long_Float'Size /= 64,
      "Ath_Hear requires a binary64 Long_Float");

   subtype Status_Code is Interfaces.Integer_32;

   Ok          : constant Status_Code := 0;
   Non_Finite  : constant Status_Code := 1;
   Not_Positive : constant Status_Code := 2;

   Reference_Ly : constant Long_Float := 10.0;
   Farther_Times : constant Long_Float := 100.0;
   Distance_Min : constant Long_Float := 1.0;
   Distance_Max : constant Long_Float := 1_000.0;
   Letter_Ly : constant Long_Float := 1_000.0;
   Generation_Years : constant Long_Float := 25.0;
   Dish_Lem_Metres : constant Long_Float := 27.0;
   Dish_Ozma_Feet : constant Long_Float := 85.0;
   Foot_Metres : constant Long_Float := 0.3048;
   Sample_Count : constant := 25;
   Gain_Floor_Db : constant Long_Float := -24.0;
   Gain_Cap_Db : constant Long_Float := 6.0;

   function Power_Factor (Distance : Long_Float) return Long_Float;
   function Intensity (Distance : Long_Float) return Long_Float;
   function Perceptual_Gain (Distance : Long_Float) return Long_Float;
   function Distance_Of (Slider : Long_Float) return Long_Float;
   function Slider_Of (Distance : Long_Float) return Long_Float;
   function Far_Distance return Long_Float;
   function Ozma_Metres return Long_Float;

   procedure Letter
     (One_Way_Years : out Long_Float;
      Round_Years   : out Long_Float;
      Generations   : out Long_Float;
      Status        : out Status_Code);

   function Sample_Distance (Index : Positive) return Long_Float;
   function Sample_Power (Index : Positive) return Long_Float;
   function Sample_X (Index : Positive) return Long_Float;
end Ath_Hear;
