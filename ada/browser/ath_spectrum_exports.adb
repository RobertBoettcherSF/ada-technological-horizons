with Ath_Spectrum;

package body Ath_Spectrum_Exports is
   use type Interfaces.Integer_32;
   Stored_Wave : Ath_Spectrum.Wavelengths := (others => 0.0);
   Stored_Kind : Ath_Spectrum.Kinds := (others => 0);
   Stored_Pos  : Ath_Spectrum.Positions := (others => 0.0);
   Stored_Min  : Long_Float := 0.0;
   Stored_Max  : Long_Float := 0.0;
   Stored_Tick_Wave : Ath_Spectrum.Tick_Wavelengths := (others => 0.0);
   Stored_Tick_Pos : Ath_Spectrum.Tick_Positions := (others => 0.0);
   Stored_Probe : Long_Float := 0.0;
   Ready : Boolean := False;

   procedure Ath_Spectrum_Map is
   begin
      Ath_Spectrum.Map_Lines
        (Stored_Wave, Stored_Kind, Stored_Pos, Stored_Min, Stored_Max);
      Ath_Spectrum.Map_Ticks (Stored_Tick_Wave, Stored_Tick_Pos);
      Ready := True;
   end Ath_Spectrum_Map;

   function Ath_Spectrum_Line_Count return Interfaces.Integer_32 is
   begin
      if not Ready then
         return 0;
      end if;
      return Ath_Spectrum.Line_Count;
   end Ath_Spectrum_Line_Count;

   function In_Range (Index : Interfaces.Integer_32) return Boolean is
   begin
      return Ready and then Index >= 1 and then Index <= Ath_Spectrum.Line_Count;
   end In_Range;

   function Ath_Spectrum_Wavelength
     (Index : Interfaces.Integer_32) return Long_Float is
   begin
      if not In_Range (Index) then
         return 0.0;
      end if;
      return Stored_Wave (Natural (Index));
   end Ath_Spectrum_Wavelength;

   function Ath_Spectrum_Kind
     (Index : Interfaces.Integer_32) return Interfaces.Integer_32 is
   begin
      if not In_Range (Index) then
         return 0;
      end if;
      return Stored_Kind (Natural (Index));
   end Ath_Spectrum_Kind;

   function Ath_Spectrum_Position
     (Index : Interfaces.Integer_32) return Long_Float is
   begin
      if not In_Range (Index) then
         return 0.0;
      end if;
      return Stored_Pos (Natural (Index));
   end Ath_Spectrum_Position;

   function Ath_Spectrum_Axis_Min return Long_Float is
   begin
      return Stored_Min;
   end Ath_Spectrum_Axis_Min;

   function Ath_Spectrum_Axis_Max return Long_Float is
   begin
      return Stored_Max;
   end Ath_Spectrum_Axis_Max;

   function Ath_Spectrum_Tick_Count return Interfaces.Integer_32 is
   begin
      if not Ready then
         return 0;
      end if;
      return Ath_Spectrum.Tick_Count;
   end Ath_Spectrum_Tick_Count;

   function Tick_In_Range (Index : Interfaces.Integer_32) return Boolean is
   begin
      return Ready and then Index >= 1 and then Index <= Ath_Spectrum.Tick_Count;
   end Tick_In_Range;

   function Ath_Spectrum_Tick_Wavelength
     (Index : Interfaces.Integer_32) return Long_Float is
   begin
      if not Tick_In_Range (Index) then
         return 0.0;
      end if;
      return Stored_Tick_Wave (Natural (Index));
   end Ath_Spectrum_Tick_Wavelength;

   function Ath_Spectrum_Tick_Position
     (Index : Interfaces.Integer_32) return Long_Float is
   begin
      if not Tick_In_Range (Index) then
         return 0.0;
      end if;
      return Stored_Tick_Pos (Natural (Index));
   end Ath_Spectrum_Tick_Position;

   function Ath_Spectrum_Tc99_Years return Long_Float is
   begin
      return Ath_Spectrum.Tc99_Years;
   end Ath_Spectrum_Tc99_Years;

   function Ath_Spectrum_Tc97_Years return Long_Float is
   begin
      return Ath_Spectrum.Tc97_Years;
   end Ath_Spectrum_Tc97_Years;

   function Ath_Spectrum_Tc98_Years return Long_Float is
   begin
      return Ath_Spectrum.Tc98_Years;
   end Ath_Spectrum_Tc98_Years;

   function Ath_Spectrum_Place
     (Wavelength : Long_Float) return Interfaces.Integer_32 is
      Status : Ath_Spectrum.Status_Code;
   begin
      Ath_Spectrum.Place (Wavelength, Stored_Probe, Status);
      return Interfaces.Integer_32 (Status);
   end Ath_Spectrum_Place;

   function Ath_Spectrum_Place_Position return Long_Float is
   begin
      return Stored_Probe;
   end Ath_Spectrum_Place_Position;
end Ath_Spectrum_Exports;
