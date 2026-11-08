with Ada.Command_Line;
with Ada.Text_IO;
with Ada.Unchecked_Conversion;
with Interfaces;
with Ath_Delay;
with Ath_Delay_Exports;

procedure Delay_Tests is
   use type Interfaces.Integer_32;
   use type Ath_Delay.Status_Code;

   type Bits is mod 2 ** 64;
   function To_Bits is new Ada.Unchecked_Conversion (Long_Float, Bits);
   function To_Float is new Ada.Unchecked_Conversion (Bits, Long_Float);

   Failures : Natural := 0;

   function Hex (Value : Bits) return String is
      Alphabet : constant String := "0123456789abcdef";
      Image    : String (1 .. 16) := (others => '0');
      Rest     : Bits := Value;
   begin
      for Index in reverse Image'Range loop
         Image (Index) := Alphabet (Natural (Rest mod 16) + 1);
         Rest := Rest / 16;
      end loop;
      return Image;
   end Hex;

   procedure Fail (Name : String) is
   begin
      Failures := Failures + 1;
      Ada.Text_IO.Put_Line ("FAIL " & Name);
   end Fail;

   procedure Emit
     (Name : String;
      Distance, Unit, One_Way, Round_Trip : Long_Float;
      Status : Ath_Delay.Status_Code)
   is
   begin
      Ada.Text_IO.Put_Line
        ("DELAY " & Name &
         Interfaces.Integer_32'Image (Interfaces.Integer_32 (Status)) &
         " " & Hex (To_Bits (One_Way)) & " " & Hex (To_Bits (Round_Trip)) &
         " " & Hex (To_Bits (Distance)) & " " & Hex (To_Bits (Unit)));
   end Emit;

   procedure Expect
     (Name : String;
      Distance, Unit : Long_Float;
      Expected : Ath_Delay.Status_Code;
      Expected_One : Long_Float := 0.0;
      Expected_Round : Long_Float := 0.0)
   is
      One_Way, Round_Trip : Long_Float;
      Status : Ath_Delay.Status_Code;
   begin
      Ath_Delay.Propagate (Distance, Unit, One_Way, Round_Trip, Status);
      if Status /= Expected then
         Fail (Name & " status");
      end if;
      if Expected = Ath_Delay.Ok then
         if One_Way /= Expected_One or else Round_Trip /= Expected_Round then
            Fail (Name & " value");
         end if;
      elsif One_Way /= 0.0 or else Round_Trip /= 0.0 then
         Fail (Name & " cleared");
      end if;
      Emit (Name, Distance, Unit, One_Way, Round_Trip, Status);
   end Expect;

   Export_Status : Interfaces.Integer_32;
   Moon_Seconds : constant Long_Float := 384_400.0 * 1_000.0 / Ath_Delay.Speed_Of_Light;
   Mars_Seconds : constant Long_Float :=
     225_000_000.0 * 1_000.0 / Ath_Delay.Speed_Of_Light;
   Au_Seconds : constant Long_Float :=
     Ath_Delay.Astronomical_Unit_Metres / Ath_Delay.Speed_Of_Light;
begin
   Expect
     ("thousand-ly", 1_000.0, Ath_Delay.Unit_Light_Years, Ath_Delay.Ok,
      1_000.0 * Ath_Delay.Julian_Year_Seconds,
      2_000.0 * Ath_Delay.Julian_Year_Seconds);
   Expect ("zero-km", 0.0, Ath_Delay.Unit_Kilometres, Ath_Delay.Ok, 0.0, 0.0);
   Expect
     ("moon", Ath_Delay.Preset_Distance (1), Ath_Delay.Preset_Unit (1),
      Ath_Delay.Ok, Moon_Seconds, Moon_Seconds * 2.0);
   Expect
     ("mars", Ath_Delay.Preset_Distance (2), Ath_Delay.Preset_Unit (2),
      Ath_Delay.Ok, Mars_Seconds, Mars_Seconds * 2.0);
   Expect
     ("one-au", 1.0, Ath_Delay.Unit_Astronomical, Ath_Delay.Ok,
      Au_Seconds, Au_Seconds * 2.0);
   Expect ("negative", -1.0, Ath_Delay.Unit_Kilometres, Ath_Delay.Negative);
   Expect
     ("nan", 1.0, To_Float (16#7FF8_0000_0000_0001#), Ath_Delay.Non_Finite_Input);
   Expect ("bad-unit", 1.0, 4.0, Ath_Delay.Bad_Unit);
   Expect
     ("overflow", 1.0e307, Ath_Delay.Unit_Light_Years, Ath_Delay.Result_Not_Finite);

   if Ath_Delay.Preset_Distance (1) /= 384_400.0
     or else Ath_Delay.Preset_Unit (1) /= Ath_Delay.Unit_Kilometres
     or else Ath_Delay.Preset_Distance (2) /= 225_000_000.0
     or else Ath_Delay.Preset_Unit (2) /= Ath_Delay.Unit_Kilometres
     or else Ath_Delay.Preset_Distance (3) /= 1_000.0
     or else Ath_Delay.Preset_Unit (3) /= Ath_Delay.Unit_Light_Years
   then
      Fail ("presets");
   end if;

   Export_Status :=
     Ath_Delay_Exports.Ath_Delay_F64 (1_000.0, Ath_Delay.Unit_Light_Years);
   if Export_Status /= 0
     or else Ath_Delay_Exports.Ath_Delay_One_Way /=
       1_000.0 * Ath_Delay.Julian_Year_Seconds
     or else Ath_Delay_Exports.Ath_Delay_Round_Trip /=
       2_000.0 * Ath_Delay.Julian_Year_Seconds
     or else Ath_Delay_Exports.Ath_Delay_Event_Count /= 3
     or else Ath_Delay_Exports.Ath_Delay_Event_Time (1) /= 0.0
     or else Ath_Delay_Exports.Ath_Delay_Event_Time (2) /=
       Ath_Delay_Exports.Ath_Delay_One_Way
     or else Ath_Delay_Exports.Ath_Delay_Event_Time (3) /=
       Ath_Delay_Exports.Ath_Delay_Round_Trip
     or else Ath_Delay_Exports.Ath_Delay_Preset_Count /= 3
     or else Ath_Delay_Exports.Ath_Delay_Preset_Distance (1) /= 384_400.0
   then
      Fail ("export thousand");
   end if;
   Export_Status := Ath_Delay_Exports.Ath_Delay_F64 (-5.0, 0.0);
   if Export_Status /= Ath_Delay.Negative
     or else Ath_Delay_Exports.Ath_Delay_One_Way /= 0.0
     or else Ath_Delay_Exports.Ath_Delay_Round_Trip /= 0.0
     or else Ath_Delay_Exports.Ath_Delay_Event_Time (2) /= 0.0
   then
      Fail ("export clears");
   end if;

   if Failures = 0 then
      Ada.Text_IO.Put_Line ("DELAY OK");
   else
      Ada.Text_IO.Put_Line ("DELAY FAILURES" & Failures'Image);
      Ada.Command_Line.Set_Exit_Status (Ada.Command_Line.Failure);
   end if;
end Delay_Tests;
