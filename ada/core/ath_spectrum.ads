with Interfaces;

--  Schematic wavelength map for a teaching spectrum, not an observation.
--
--  The window is 390 to 440 nm. Position is (wavelength - minimum) divided
--  by the window width. Shared lines are conventional air wavelengths of
--  well-known Fraunhofer lines. Technetium lines are the Tc I air
--  wavelengths 403.163, 423.819, 426.227 and 429.706 nm.
package Ath_Spectrum is
   pragma Compile_Time_Error
     (Long_Float'Size /= 64,
      "Ath_Spectrum requires a binary64 Long_Float");

   Line_Count : constant := 9;

   Window_Min : constant Long_Float := 390.0;
   Window_Max : constant Long_Float := 440.0;

   --  Published half-lives, in years. Not Lem's "few thousand years".
   --  211,100, 4,210,000 and 4,200,000 are the nearest whole years to
   --  2.111e5, 4.21e6 and 4.2e6, and they are exact binary64 values.
   Tc99_Years : constant Long_Float := 211_100.0;
   Tc97_Years : constant Long_Float := 4_210_000.0;
   Tc98_Years : constant Long_Float := 4_200_000.0;

   Tick_Count : constant := 6;

   subtype Status_Code is Interfaces.Integer_32;
   Ok        : constant Status_Code := 0;
   Outside   : constant Status_Code := 1;
   Non_Finite : constant Status_Code := 2;

   type Wavelengths is array (1 .. Line_Count) of Long_Float;
   type Kinds is array (1 .. Line_Count) of Interfaces.Integer_32;
   type Positions is array (1 .. Line_Count) of Long_Float;
   type Tick_Wavelengths is array (1 .. Tick_Count) of Long_Float;
   type Tick_Positions is array (1 .. Tick_Count) of Long_Float;

   Kind_Shared     : constant Interfaces.Integer_32 := 0;
   Kind_Technetium : constant Interfaces.Integer_32 := 1;

   procedure Map_Lines
     (Line_Wavelength : out Wavelengths;
      Line_Kind       : out Kinds;
      Line_Position   : out Positions;
      Axis_Min        : out Long_Float;
      Axis_Max        : out Long_Float);

   procedure Place
     (Wavelength : Long_Float;
      Position   : out Long_Float;
      Status     : out Status_Code);

   procedure Map_Ticks
     (Tick_Wavelength : out Tick_Wavelengths;
      Tick_Position   : out Tick_Positions);
end Ath_Spectrum;
