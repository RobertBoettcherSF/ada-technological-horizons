with Interfaces;

package Ath_Sixes_Exports is
   function Ath_Sixes_Single return Long_Float
   with Export, Convention => C, External_Name => "ath_sixes_single";

   function Ath_Sixes_Chance (Trials : Long_Float) return Interfaces.Integer_32
   with Export, Convention => C, External_Name => "ath_sixes_chance";

   function Ath_Sixes_Chance_Value return Long_Float
   with Export, Convention => C, External_Name => "ath_sixes_chance_value";

   function Ath_Sixes_Caption return Interfaces.Integer_32
   with Export, Convention => C, External_Name => "ath_sixes_caption";

   function Ath_Sixes_Players_Of (Slider : Long_Float) return Long_Float
   with Export, Convention => C, External_Name => "ath_sixes_players_of";

   function Ath_Sixes_Slider_Of (Players : Long_Float) return Long_Float
   with Export, Convention => C, External_Name => "ath_sixes_slider_of";

   function Ath_Sixes_Sample_Count return Interfaces.Integer_32
   with Export, Convention => C, External_Name => "ath_sixes_sample_count";

   function Ath_Sixes_Sample_Players (Index : Interfaces.Integer_32) return Long_Float
   with Export, Convention => C, External_Name => "ath_sixes_sample_players";

   function Ath_Sixes_Sample_Chance (Index : Interfaces.Integer_32) return Long_Float
   with Export, Convention => C, External_Name => "ath_sixes_sample_chance";

   function Ath_Sixes_Sample_X (Index : Interfaces.Integer_32) return Long_Float
   with Export, Convention => C, External_Name => "ath_sixes_sample_x";

   function Ath_Sixes_Egg_Count return Long_Float
   with Export, Convention => C, External_Name => "ath_sixes_egg_count";

   function Ath_Sixes_Egg_Single return Long_Float
   with Export, Convention => C, External_Name => "ath_sixes_egg_single";

   function Ath_Sixes_Eggs_Of (Slider : Long_Float) return Long_Float
   with Export, Convention => C, External_Name => "ath_sixes_eggs_of";

   function Ath_Sixes_Egg_Slider (Eggs : Long_Float) return Long_Float
   with Export, Convention => C, External_Name => "ath_sixes_egg_slider";

   function Ath_Sixes_Egg_Chance (Eggs : Long_Float) return Interfaces.Integer_32
   with Export, Convention => C, External_Name => "ath_sixes_egg_chance";

   function Ath_Sixes_Egg_Chance_Value return Long_Float
   with Export, Convention => C, External_Name => "ath_sixes_egg_chance_value";

   function Ath_Sixes_Egg_Expected return Long_Float
   with Export, Convention => C, External_Name => "ath_sixes_egg_expected";

   function Ath_Sixes_Egg_Sample_Eggs (Index : Interfaces.Integer_32) return Long_Float
   with Export, Convention => C, External_Name => "ath_sixes_egg_sample_eggs";

   function Ath_Sixes_Egg_Sample_Chance (Index : Interfaces.Integer_32) return Long_Float
   with Export, Convention => C, External_Name => "ath_sixes_egg_sample_chance";

   function Ath_Sixes_Egg_Sample_X (Index : Interfaces.Integer_32) return Long_Float
   with Export, Convention => C, External_Name => "ath_sixes_egg_sample_x";

   function Ath_Sixes_Roll (Set_Index : Interfaces.Integer_32) return Interfaces.Integer_32
   with Export, Convention => C, External_Name => "ath_sixes_roll";

   function Ath_Sixes_Face (Die : Interfaces.Integer_32) return Interfaces.Integer_32
   with Export, Convention => C, External_Name => "ath_sixes_face";

   function Ath_Sixes_Six_Count return Interfaces.Integer_32
   with Export, Convention => C, External_Name => "ath_sixes_six_count";
end Ath_Sixes_Exports;
