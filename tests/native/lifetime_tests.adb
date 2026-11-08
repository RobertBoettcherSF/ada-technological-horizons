with Ada.Command_Line;
with Ada.Text_IO;
with Ada.Unchecked_Conversion;
with Interfaces;
with Ath_Lifetime;
with Ath_Lifetime_Exports;

procedure Lifetime_Tests is
   use type Interfaces.Integer_32;
   use type Ath_Lifetime.Status_Code;

   type Bits is mod 2 ** 64;

   function To_Bits is new Ada.Unchecked_Conversion (Long_Float, Bits);

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

   function Defaults_P return Ath_Lifetime.Fate_Values is
   begin
      return (5.0, 60.0, 15.0, 20.0);
   end Defaults_P;

   function Defaults_D return Ath_Lifetime.Fate_Values is
   begin
      return (100.0, 30.0, 30_000.0, 10_000.0);
   end Defaults_D;

   procedure Emit
     (Name          : String;
      Percentages   : Ath_Lifetime.Fate_Values;
      Durations     : Ath_Lifetime.Fate_Values;
      Status        : Ath_Lifetime.Status_Code;
      Mean          : Long_Float;
      Contributions : Ath_Lifetime.Fate_Values)
   is
   begin
      Ada.Text_IO.Put
        ("LIFE " & Name & " " &
         Interfaces.Integer_32'Image (Interfaces.Integer_32 (Status)));
      Ada.Text_IO.Put (" " & Hex (To_Bits (Mean)));
      for Index in Contributions'Range loop
         Ada.Text_IO.Put (" " & Hex (To_Bits (Contributions (Index))));
      end loop;
      for Index in Percentages'Range loop
         Ada.Text_IO.Put (" " & Hex (To_Bits (Percentages (Index))));
      end loop;
      for Index in Durations'Range loop
         Ada.Text_IO.Put (" " & Hex (To_Bits (Durations (Index))));
      end loop;
      Ada.Text_IO.New_Line;
   end Emit;

   procedure Expect
     (Name          : String;
      Percentages   : Ath_Lifetime.Fate_Values;
      Durations     : Ath_Lifetime.Fate_Values;
      Expected      : Ath_Lifetime.Status_Code;
      Mean_Expected : Long_Float := 0.0;
      Shares        : Ath_Lifetime.Fate_Values := (others => 0.0))
   is
      Contributions : Ath_Lifetime.Fate_Values;
      Mean          : Long_Float;
      Status        : Ath_Lifetime.Status_Code;
   begin
      Ath_Lifetime.Weighted_Mean
        (Percentages, Durations, Contributions, Mean, Status);
      if Status /= Expected then
         Fail (Name & " status");
      end if;
      if Expected = Ath_Lifetime.Ok then
         if Mean /= Mean_Expected or else To_Bits (Mean) /= To_Bits (Mean_Expected) then
            Fail (Name & " mean");
         end if;
         for Index in Shares'Range loop
            if Contributions (Index) /= Shares (Index) then
               Fail (Name & " share");
            end if;
         end loop;
      else
         if Mean /= 0.0 then
            Fail (Name & " cleared");
         end if;
      end if;
      Emit (Name, Percentages, Durations, Status, Mean, Contributions);
   end Expect;

   P : Ath_Lifetime.Fate_Values;
   D : Ath_Lifetime.Fate_Values;
   Export_Status : Interfaces.Integer_32;
begin
   Expect
     ("defaults",
      Defaults_P, Defaults_D, Ath_Lifetime.Ok, 6_523.0,
      (5.0, 18.0, 4_500.0, 2_000.0));

   D := Defaults_D;
   D (4) := 20_000.0;
   Expect
     ("interest-20000",
      Defaults_P, D, Ath_Lifetime.Ok, 8_523.0,
      (5.0, 18.0, 4_500.0, 4_000.0));

   Expect
     ("single-fate",
      (100.0, 0.0, 0.0, 0.0),
      (42.0, 9_999.0, 9_999.0, 9_999.0),
      Ath_Lifetime.Ok, 42.0, (42.0, 0.0, 0.0, 0.0));

   Expect
     ("zero-durations",
      Defaults_P, (0.0, 0.0, 0.0, 0.0),
      Ath_Lifetime.Ok, 0.0, (others => 0.0));

   P := Defaults_P;
   P (2) := 50.0;
   Expect ("total-90", P, Defaults_D, Ath_Lifetime.Total_Out_Of_Range);

   P := Defaults_P;
   P (1) := 15.0;
   Expect ("total-110", P, Defaults_D, Ath_Lifetime.Total_Out_Of_Range);

   P := Defaults_P;
   P (1) := -5.0;
   P (2) := 70.0;
   Expect ("negative-probability", P, Defaults_D, Ath_Lifetime.Probability_Out_Of_Range);

   D := Defaults_D;
   D (2) := -1.0;
   Expect ("negative-duration", Defaults_P, D, Ath_Lifetime.Duration_Negative);

   declare
      function To_Float is new Ada.Unchecked_Conversion (Bits, Long_Float);
   begin
      P := Defaults_P;
      P (3) := To_Float (16#7FF8_0000_0000_0001#);
      Expect ("nan-probability", P, Defaults_D, Ath_Lifetime.Non_Finite_Input);
      D := Defaults_D;
      D (1) := To_Float (16#7FF0_0000_0000_0000#);
      Expect ("infinity-duration", Defaults_P, D, Ath_Lifetime.Non_Finite_Input);
   end;

   P := (others => 25.0);
   D := (others => Long_Float'Last);
   declare
      Contributions : Ath_Lifetime.Fate_Values;
      Mean          : Long_Float;
      Status        : Ath_Lifetime.Status_Code;
   begin
      Ath_Lifetime.Weighted_Mean (P, D, Contributions, Mean, Status);
      if Status /= Ath_Lifetime.Ok and then Status /= Ath_Lifetime.Result_Not_Finite then
         Fail ("last-durations status");
      end if;
      if Status = Ath_Lifetime.Result_Not_Finite and then Mean /= 0.0 then
         Fail ("last-durations cleared");
      end if;
      Emit ("last-durations", P, D, Status, Mean, Contributions);
   end;

   Export_Status :=
     Ath_Lifetime_Exports.Ath_Lifetime_F64
       (5.0, 60.0, 15.0, 20.0, 100.0, 30.0, 30_000.0, 10_000.0);
   if Export_Status /= 0
     or else Ath_Lifetime_Exports.Ath_Lifetime_Mean /= 6_523.0
     or else Ath_Lifetime_Exports.Ath_Lifetime_Contribution (4) /= 2_000.0
   then
      Fail ("export defaults");
   end if;
   Export_Status :=
     Ath_Lifetime_Exports.Ath_Lifetime_F64
       (5.0, 50.0, 15.0, 20.0, 100.0, 30.0, 30_000.0, 10_000.0);
   if Export_Status /= Ath_Lifetime.Total_Out_Of_Range
     or else Ath_Lifetime_Exports.Ath_Lifetime_Mean /= 0.0
     or else Ath_Lifetime_Exports.Ath_Lifetime_Contribution (3) /= 0.0
   then
      Fail ("export clears stale mean");
   end if;

   if Failures = 0 then
      Ada.Text_IO.Put_Line ("LIFETIME OK");
   else
      Ada.Text_IO.Put_Line ("LIFETIME FAILURES" & Failures'Image);
      Ada.Command_Line.Set_Exit_Status (Ada.Command_Line.Failure);
   end if;
end Lifetime_Tests;
