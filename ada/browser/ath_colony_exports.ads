with Interfaces;

package Ath_Colony_Exports is
   function Ath_Colony_Left return Long_Float
   with Export, Convention => C, External_Name => "ath_colony_left";

   function Ath_Colony_Self return Long_Float
   with Export, Convention => C, External_Name => "ath_colony_self";

   function Ath_Colony_Other return Long_Float
   with Export, Convention => C, External_Name => "ath_colony_other";

   function Ath_Colony_Escapers (Choice : Interfaces.Integer_32) return Long_Float
   with Export, Convention => C, External_Name => "ath_colony_escapers";

   function Ath_Colony_Faded (Choice : Interfaces.Integer_32) return Long_Float
   with Export, Convention => C, External_Name => "ath_colony_faded";

   function Ath_Colony_One_In (Alive : Long_Float) return Long_Float
   with Export, Convention => C, External_Name => "ath_colony_one_in";

   function Ath_Colony_Shows_Count (Alive : Long_Float) return Interfaces.Integer_32
   with Export, Convention => C, External_Name => "ath_colony_shows_count";

   function Ath_Colony_Distance_Fits
     (Alive    : Long_Float;
      Distance : Long_Float) return Interfaces.Integer_32
   with Export, Convention => C, External_Name => "ath_colony_distance_fits";

   function Ath_Colony_Survivors
     (Choice : Interfaces.Integer_32;
      Years  : Long_Float) return Interfaces.Integer_32
   with Export, Convention => C, External_Name => "ath_colony_survivors";

   function Ath_Colony_Alive return Long_Float
   with Export, Convention => C, External_Name => "ath_colony_alive";

   function Ath_Colony_Distance return Long_Float
   with Export, Convention => C, External_Name => "ath_colony_distance";

   function Ath_Colony_Life_Of (Slider : Long_Float) return Long_Float
   with Export, Convention => C, External_Name => "ath_colony_life_of";

   function Ath_Colony_Slider_Of (Years : Long_Float) return Long_Float
   with Export, Convention => C, External_Name => "ath_colony_slider_of";

   function Ath_Colony_Cell_Count return Interfaces.Integer_32
   with Export, Convention => C, External_Name => "ath_colony_cell_count";

   function Ath_Colony_Cell_Role
     (Index  : Interfaces.Integer_32;
      Choice : Interfaces.Integer_32) return Interfaces.Integer_32
   with Export, Convention => C, External_Name => "ath_colony_cell_role";

   function Ath_Colony_Fill
     (Hop_Ly    : Long_Float;
      Hop_Years : Long_Float) return Interfaces.Integer_32
   with Export, Convention => C, External_Name => "ath_colony_fill";

   function Ath_Colony_Hops return Long_Float
   with Export, Convention => C, External_Name => "ath_colony_hops";

   function Ath_Colony_Fill_Years return Long_Float
   with Export, Convention => C, External_Name => "ath_colony_fill_years";

   function Ath_Colony_Times
     (Life_Years : Long_Float;
      Fill_Years : Long_Float) return Long_Float
   with Export, Convention => C, External_Name => "ath_colony_times";

   function Ath_Colony_Star_Count return Interfaces.Integer_32
   with Export, Convention => C, External_Name => "ath_colony_star_count";

   function Ath_Colony_Star_X (Index : Interfaces.Integer_32) return Long_Float
   with Export, Convention => C, External_Name => "ath_colony_star_x";

   function Ath_Colony_Star_Y (Index : Interfaces.Integer_32) return Long_Float
   with Export, Convention => C, External_Name => "ath_colony_star_y";

   function Ath_Colony_Generation
     (Index   : Interfaces.Integer_32;
      Origin  : Interfaces.Integer_32;
      Hop_Ly  : Long_Float) return Interfaces.Integer_32
   with Export, Convention => C, External_Name => "ath_colony_generation";

   function Ath_Colony_Sample_Count return Interfaces.Integer_32
   with Export, Convention => C, External_Name => "ath_colony_sample_count";

   function Ath_Colony_Sample_Years (Index : Interfaces.Integer_32) return Long_Float
   with Export, Convention => C, External_Name => "ath_colony_sample_years";

   function Ath_Colony_Window return Long_Float
   with Export, Convention => C, External_Name => "ath_colony_window";

   function Ath_Colony_Radius return Long_Float
   with Export, Convention => C, External_Name => "ath_colony_radius";

   function Ath_Colony_Life_Min return Long_Float
   with Export, Convention => C, External_Name => "ath_colony_life_min";

   function Ath_Colony_Life_Max return Long_Float
   with Export, Convention => C, External_Name => "ath_colony_life_max";

   function Ath_Colony_Hop_Min return Long_Float
   with Export, Convention => C, External_Name => "ath_colony_hop_min";

   function Ath_Colony_Hop_Max return Long_Float
   with Export, Convention => C, External_Name => "ath_colony_hop_max";

   function Ath_Colony_Time_Min return Long_Float
   with Export, Convention => C, External_Name => "ath_colony_time_min";

   function Ath_Colony_Time_Max return Long_Float
   with Export, Convention => C, External_Name => "ath_colony_time_max";

   function Ath_Colony_Hop_Of (Slider : Long_Float) return Long_Float
   with Export, Convention => C, External_Name => "ath_colony_hop_of";

   function Ath_Colony_Time_Of (Slider : Long_Float) return Long_Float
   with Export, Convention => C, External_Name => "ath_colony_time_of";
end Ath_Colony_Exports;
