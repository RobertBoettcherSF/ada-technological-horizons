with Interfaces;

package Ath_Spectrum_Exports is
   procedure Ath_Spectrum_Map
   with Export, Convention => C, External_Name => "ath_spectrum_map";

   function Ath_Spectrum_Line_Count return Interfaces.Integer_32
   with Export, Convention => C, External_Name => "ath_spectrum_line_count";

   function Ath_Spectrum_Wavelength
     (Index : Interfaces.Integer_32) return Long_Float
   with Export, Convention => C, External_Name => "ath_spectrum_wavelength";

   function Ath_Spectrum_Kind
     (Index : Interfaces.Integer_32) return Interfaces.Integer_32
   with Export, Convention => C, External_Name => "ath_spectrum_kind";

   function Ath_Spectrum_Position
     (Index : Interfaces.Integer_32) return Long_Float
   with Export, Convention => C, External_Name => "ath_spectrum_position";

   function Ath_Spectrum_Axis_Min return Long_Float
   with Export, Convention => C, External_Name => "ath_spectrum_axis_min";

   function Ath_Spectrum_Axis_Max return Long_Float
   with Export, Convention => C, External_Name => "ath_spectrum_axis_max";

   function Ath_Spectrum_Tick_Count return Interfaces.Integer_32
   with Export, Convention => C, External_Name => "ath_spectrum_tick_count";

   function Ath_Spectrum_Tick_Wavelength
     (Index : Interfaces.Integer_32) return Long_Float
   with Export, Convention => C, External_Name => "ath_spectrum_tick_wavelength";

   function Ath_Spectrum_Tick_Position
     (Index : Interfaces.Integer_32) return Long_Float
   with Export, Convention => C, External_Name => "ath_spectrum_tick_position";

   function Ath_Spectrum_Tc99_Years return Long_Float
   with Export, Convention => C, External_Name => "ath_spectrum_tc99_years";

   function Ath_Spectrum_Tc97_Years return Long_Float
   with Export, Convention => C, External_Name => "ath_spectrum_tc97_years";

   function Ath_Spectrum_Tc98_Years return Long_Float
   with Export, Convention => C, External_Name => "ath_spectrum_tc98_years";

   function Ath_Spectrum_Place
     (Wavelength : Long_Float) return Interfaces.Integer_32
   with Export, Convention => C, External_Name => "ath_spectrum_place";

   function Ath_Spectrum_Place_Position return Long_Float
   with Export, Convention => C, External_Name => "ath_spectrum_place_position";
end Ath_Spectrum_Exports;
