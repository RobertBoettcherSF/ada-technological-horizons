with Ada.Command_Line;
with Ada.Text_IO;
with Interfaces;
with Ath_Galaxy;
with Ath_Galaxy_Exports;

procedure Galaxy_Tests is
   use type Interfaces.Integer_32;
   use type Ath_Galaxy.Status_Code;

   Failures : Natural := 0;

   procedure Fail (Name : String) is
   begin
      Failures := Failures + 1;
      Ada.Text_IO.Put_Line ("FAIL " & Name);
   end Fail;

   procedure Check
     (Years : Long_Float;
      Modern : Boolean;
      Name : String) is
      Count, Distance, Share, Systems : Long_Float;
      Known, Saturated : Boolean;
      Caption : Interfaces.Integer_32;
      Status : Ath_Galaxy.Status_Code;
   begin
      Ath_Galaxy.Evaluate
        (Years, Modern, Count, Distance, Known, Share, Saturated, Caption, Systems, Status);
      if Name = "book" then
         if Status /= Ath_Galaxy.Ok or else abs (Count - (6_523.0 / 15.0)) > 1.0e-6 then
            Fail (Name);
         end if;
         if not Known or else Saturated or else Caption /= Ath_Galaxy.Caption_Some then
            Fail (Name & "-flags");
         end if;
      elsif Name = "zero" then
         if Status /= Ath_Galaxy.Ok or else Count /= 0.0 or else Known then
            Fail (Name);
         end if;
      elsif Name = "full" then
         if Status /= Ath_Galaxy.Ok or else Count /= 1.0e9 or else not Saturated then
            Fail (Name);
         end if;
      elsif Name = "beyond" then
         if Status /= Ath_Galaxy.Ok or else Count /= 1.0e9 then
            Fail (Name);
         end if;
      elsif Name = "negative" then
         if Status /= Ath_Galaxy.Negative or else Count /= 0.0 then
            Fail (Name);
         end if;
      elsif Name = "modern" then
         if Status /= Ath_Galaxy.Ok or else abs (Count - 65_230.0) > 1.0e-4 then
            Fail (Name);
         end if;
      end if;
   end Check;
begin
   Check (6_523.0, False, "book");
   Check (0.0, False, "zero");
   Check (Ath_Galaxy.Window_Years, False, "full");
   Check (Ath_Galaxy.Window_Years * 2.0, False, "beyond");
   Check (-1.0, False, "negative");
   Check (6_523.0, True, "modern");

   if abs (Ath_Galaxy.Years_Of (0.0) - 100.0) > 1.0e-6
     or else abs (Ath_Galaxy.Years_Of (1.0) - 1.0e10) > 1.0e-2
   then
      Fail ("slider");
   end if;

   declare
      Lit : Natural := 0;
      X, Y : Long_Float;
   begin
      for Index in 1 .. Ath_Galaxy.Dot_Count loop
         Ath_Galaxy.Dot (Index, X, Y);
         if X * X + Y * Y > 1.2 then
            Fail ("dot-outside");
         end if;
         if Ath_Galaxy.Dot_Lit (Index, 0.0, 0.2) then
            Fail ("lit-zero");
         end if;
         if not Ath_Galaxy.Dot_Lit (Index, 1.0, 0.2) then
            Fail ("lit-all");
         end if;
         if Ath_Galaxy.Dot_Lit (Index, 0.25, 0.0) then
            Lit := Lit + 1;
         end if;
      end loop;
      if Lit = 0 or else Lit = Ath_Galaxy.Dot_Count then
         Fail ("lit-some");
      end if;
   end;

   declare
      Life, Distance, Upper_Ignored : Ath_Galaxy.Pin_Values;
      Upper : Ath_Galaxy.Pin_Flags;
      Slider : Ath_Galaxy.Pin_Values;
   begin
      Ath_Galaxy.Pins (Life, Distance, Upper, Slider);
      if Life (1) /= 6_500.0 or else Distance (1) /= 1_000.0
        or else Distance (2) /= 50.0 or else Upper (3) /= 1
      then
         Fail ("pins");
      end if;
   end;

   if Ath_Galaxy_Exports.Ath_Galaxy_F64 (6_523.0, 0) /= 0
     or else abs (Ath_Galaxy_Exports.Ath_Galaxy_Count - (6_523.0 / 15.0)) > 1.0e-6
     or else Ath_Galaxy_Exports.Ath_Galaxy_Sample_Count /= Ath_Galaxy.Sample_Count
     or else Ath_Galaxy_Exports.Ath_Galaxy_F64 (0.0, 0) /= 0
     or else Ath_Galaxy_Exports.Ath_Galaxy_Distance_Known /= 0
   then
      Fail ("export");
   end if;

   if Failures = 0 then
      Ada.Text_IO.Put_Line ("GALAXY OK");
   else
      Ada.Text_IO.Put_Line ("GALAXY FAILURES" & Failures'Image);
      Ada.Command_Line.Set_Exit_Status (Ada.Command_Line.Failure);
   end if;
end Galaxy_Tests;
