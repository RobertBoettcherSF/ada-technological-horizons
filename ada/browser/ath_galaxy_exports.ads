with Interfaces;

package Ath_Galaxy_Exports is
   function Ath_Galaxy_F64
     (Years : Long_Float;
      Modern : Interfaces.Integer_32) return Interfaces.Integer_32
   with Export, Convention => C, External_Name => "ath_galaxy_f64";

   function Ath_Galaxy_Count return Long_Float
   with Export, Convention => C, External_Name => "ath_galaxy_count";

   function Ath_Galaxy_Distance return Long_Float
   with Export, Convention => C, External_Name => "ath_galaxy_distance";

   function Ath_Galaxy_Distance_Known return Interfaces.Integer_32
   with Export, Convention => C, External_Name => "ath_galaxy_distance_known";

   function Ath_Galaxy_Share return Long_Float
   with Export, Convention => C, External_Name => "ath_galaxy_share";

   function Ath_Galaxy_Saturated return Interfaces.Integer_32
   with Export, Convention => C, External_Name => "ath_galaxy_saturated";

   function Ath_Galaxy_Caption return Interfaces.Integer_32
   with Export, Convention => C, External_Name => "ath_galaxy_caption";

   function Ath_Galaxy_Systems return Long_Float
   with Export, Convention => C, External_Name => "ath_galaxy_systems";

   function Ath_Galaxy_Window return Long_Float
   with Export, Convention => C, External_Name => "ath_galaxy_window";

   function Ath_Galaxy_Radius return Long_Float
   with Export, Convention => C, External_Name => "ath_galaxy_radius";

   function Ath_Galaxy_Ring return Long_Float
   with Export, Convention => C, External_Name => "ath_galaxy_ring";

   function Ath_Galaxy_Book_Years return Long_Float
   with Export, Convention => C, External_Name => "ath_galaxy_book_years";

   function Ath_Galaxy_Slider_Of (Years : Long_Float) return Long_Float
   with Export, Convention => C, External_Name => "ath_galaxy_slider_of";

   function Ath_Galaxy_Years_Of (Slider : Long_Float) return Long_Float
   with Export, Convention => C, External_Name => "ath_galaxy_years_of";

   function Ath_Galaxy_Dot_Count return Interfaces.Integer_32
   with Export, Convention => C, External_Name => "ath_galaxy_dot_count";

   function Ath_Galaxy_Dot_X (Index : Interfaces.Integer_32) return Long_Float
   with Export, Convention => C, External_Name => "ath_galaxy_dot_x";

   function Ath_Galaxy_Dot_Y (Index : Interfaces.Integer_32) return Long_Float
   with Export, Convention => C, External_Name => "ath_galaxy_dot_y";

   function Ath_Galaxy_Dot_Brightness
     (Index : Interfaces.Integer_32;
      Years : Long_Float) return Long_Float
   with Export, Convention => C, External_Name => "ath_galaxy_dot_brightness";

   function Ath_Galaxy_Dot_Lit
     (Index : Interfaces.Integer_32;
      Years : Long_Float) return Interfaces.Integer_32
   with Export, Convention => C, External_Name => "ath_galaxy_dot_lit";

   function Ath_Galaxy_Sample_Count return Interfaces.Integer_32
   with Export, Convention => C, External_Name => "ath_galaxy_sample_count";

   function Ath_Galaxy_Sample_Life (Index : Interfaces.Integer_32) return Long_Float
   with Export, Convention => C, External_Name => "ath_galaxy_sample_life";

   function Ath_Galaxy_Sample_Count_N (Index : Interfaces.Integer_32) return Long_Float
   with Export, Convention => C, External_Name => "ath_galaxy_sample_count_n";

   function Ath_Galaxy_Sample_Distance (Index : Interfaces.Integer_32) return Long_Float
   with Export, Convention => C, External_Name => "ath_galaxy_sample_distance";

   function Ath_Galaxy_Sample_X (Index : Interfaces.Integer_32) return Long_Float
   with Export, Convention => C, External_Name => "ath_galaxy_sample_x";

   function Ath_Galaxy_Sample_Y (Index : Interfaces.Integer_32) return Long_Float
   with Export, Convention => C, External_Name => "ath_galaxy_sample_y";

   function Ath_Galaxy_Distance_Min return Long_Float
   with Export, Convention => C, External_Name => "ath_galaxy_distance_min";

   function Ath_Galaxy_Distance_Max return Long_Float
   with Export, Convention => C, External_Name => "ath_galaxy_distance_max";

   function Ath_Galaxy_Distance_Pos (Distance : Long_Float) return Long_Float
   with Export, Convention => C, External_Name => "ath_galaxy_distance_pos";

   function Ath_Galaxy_Pin_Count return Interfaces.Integer_32
   with Export, Convention => C, External_Name => "ath_galaxy_pin_count";

   function Ath_Galaxy_Pin_Life (Index : Interfaces.Integer_32) return Long_Float
   with Export, Convention => C, External_Name => "ath_galaxy_pin_life";

   function Ath_Galaxy_Pin_Distance (Index : Interfaces.Integer_32) return Long_Float
   with Export, Convention => C, External_Name => "ath_galaxy_pin_distance";

   function Ath_Galaxy_Pin_Upper (Index : Interfaces.Integer_32) return Interfaces.Integer_32
   with Export, Convention => C, External_Name => "ath_galaxy_pin_upper";

   function Ath_Galaxy_Pin_Slider (Index : Interfaces.Integer_32) return Long_Float
   with Export, Convention => C, External_Name => "ath_galaxy_pin_slider";

   function Ath_Galaxy_Pin_Y (Index : Interfaces.Integer_32) return Long_Float
   with Export, Convention => C, External_Name => "ath_galaxy_pin_y";
end Ath_Galaxy_Exports;
