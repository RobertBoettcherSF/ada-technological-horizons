with Ada.Command_Line;
with Ada.Text_IO;
with Interfaces;
with Ath_Spectrum;
with Ath_Spectrum_Exports;

procedure Spectrum_Tests is
   use type Interfaces.Integer_32;
   use type Ath_Spectrum.Status_Code;

   Failures : Natural := 0;

   procedure Fail (Name : String) is
   begin
      Failures := Failures + 1;
      Ada.Text_IO.Put_Line ("FAIL " & Name);
   end Fail;

   function Expected (Wavelength : Long_Float) return Long_Float is
   begin
      return (Wavelength - 390.0) / 50.0;
   end Expected;
begin
   declare
      Waves : Ath_Spectrum.Wavelengths;
      Kinds : Ath_Spectrum.Kinds;
      Positions : Ath_Spectrum.Positions;
      Axis_Min, Axis_Max : Long_Float;
      Tc_Count : Natural := 0;
   begin
      Ath_Spectrum.Map_Lines (Waves, Kinds, Positions, Axis_Min, Axis_Max);
      if Axis_Min /= 390.0 or else Axis_Max /= 440.0 then
         Fail ("window");
      end if;
      if Waves (6) /= 403.163 or else Kinds (6) /= Ath_Spectrum.Kind_Technetium then
         Fail ("tc-403");
      end if;
      if abs (Positions (6) - Expected (403.163)) > 1.0e-12 then
         Fail ("pos-403");
      end if;
      if abs (Positions (9) - Expected (429.706)) > 1.0e-12 then
         Fail ("pos-429");
      end if;
      if Kinds (1) /= Ath_Spectrum.Kind_Shared or else Waves (1) /= 393.366 then
         Fail ("calcium");
      end if;
      for Index in Kinds'Range loop
         if Kinds (Index) = Ath_Spectrum.Kind_Technetium then
            Tc_Count := Tc_Count + 1;
         end if;
      end loop;
      if Tc_Count /= 4 then
         Fail ("tc-count");
      end if;
   end;

   declare
      Position : Long_Float;
      Status : Ath_Spectrum.Status_Code;
   begin
      Ath_Spectrum.Place (389.0, Position, Status);
      if Status /= Ath_Spectrum.Outside then
         Fail ("outside");
      end if;
   end;

   if Ath_Spectrum.Tc99_Years /= 211_100.0
     or else Ath_Spectrum.Tc97_Years /= 4_210_000.0
     or else Ath_Spectrum.Tc98_Years /= 4_200_000.0
   then
      Fail ("half-lives");
   end if;

   declare
      Wave : Ath_Spectrum.Tick_Wavelengths;
      Pos : Ath_Spectrum.Tick_Positions;
   begin
      Ath_Spectrum.Map_Ticks (Wave, Pos);
      if Wave (2) /= 400.0 or else abs (Pos (2) - 0.2) > 1.0e-12 then
         Fail ("tick-400");
      end if;
   end;

   Ath_Spectrum_Exports.Ath_Spectrum_Map;
   if Ath_Spectrum_Exports.Ath_Spectrum_Line_Count /= 9
     or else Ath_Spectrum_Exports.Ath_Spectrum_Kind (6) /= 1
     or else Ath_Spectrum_Exports.Ath_Spectrum_Kind (1) /= 0
     or else abs (Ath_Spectrum_Exports.Ath_Spectrum_Position (7) - Expected (423.819)) > 1.0e-12
     or else Ath_Spectrum_Exports.Ath_Spectrum_Place (450.0) /= 1
   then
      Fail ("export");
   end if;

   if Failures = 0 then
      Ada.Text_IO.Put_Line ("SPECTRUM OK");
   else
      Ada.Text_IO.Put_Line ("SPECTRUM FAILURES" & Failures'Image);
      Ada.Command_Line.Set_Exit_Status (Ada.Command_Line.Failure);
   end if;
end Spectrum_Tests;
